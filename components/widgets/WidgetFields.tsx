'use client'

import { Plus, X } from 'lucide-react'
import type { Block } from '@/lib/blocks'
import { widgetDef, Field } from '@/lib/widgets'

// Generic settings editor driven by a widget's field schema. Works for every
// registry widget, so new widgets need no bespoke editor code.
export default function WidgetFields({ block, onUpdate }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void }) {
  const def = widgetDef(block.type)
  if (!def) return null
  const props = block.props || {}
  const setProp = (key: string, value: any) => onUpdate(block.id, { props: { ...props, [key]: value } })

  return (
    <div className="space-y-3">
      {def.fields.map((f) => (
        <div key={f.key}>
          <div className="mb-1 text-xs font-medium text-slate-500">{f.label}</div>
          <FieldInput field={f} value={props[f.key]} onChange={(v) => setProp(f.key, v)} />
        </div>
      ))}
    </div>
  )
}

function FieldInput({ field: f, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  if (f.type === 'textarea') return <textarea className="input min-h-[60px]" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
  if (f.type === 'select') return (
    <select className="input capitalize" value={value ?? (f.options?.[0] || '')} onChange={(e) => onChange(e.target.value)}>
      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
  if (f.type === 'number') return <input type="number" className="input" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
  if (f.type === 'items') return <ItemsEditor field={f} value={Array.isArray(value) ? value : []} onChange={onChange} />
  return <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
}

function ItemsEditor({ field: f, value, onChange }: { field: Field; value: any[]; onChange: (v: any[]) => void }) {
  const itemFields = f.itemFields || []
  const blank = () => Object.fromEntries(itemFields.map((sf) => [sf.key, sf.type === 'number' ? 0 : '']))
  const setItem = (i: number, key: string, v: any) => onChange(value.map((it, j) => (j === i ? { ...it, [key]: v } : it)))
  return (
    <div className="space-y-2">
      {value.map((it, i) => (
        <div key={i} className="flex gap-2 rounded-lg bg-white p-2 ring-1 ring-slate-200">
          <div className="flex-1 space-y-1.5">
            {itemFields.map((sf) => (
              <FieldInput key={sf.key} field={sf} value={it[sf.key]} onChange={(v) => setItem(i, sf.key, v)} />
            ))}
          </div>
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="btn-danger !px-2 self-start" aria-label="Remove"><X className="h-4 w-4" /></button>
        </div>
      ))}
      <button onClick={() => onChange([...value, blank()])} className="btn-outline !py-1 text-xs"><Plus className="h-3.5 w-3.5" /> Add</button>
    </div>
  )
}
