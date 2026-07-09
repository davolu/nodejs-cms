'use client'

import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Plus, X } from 'lucide-react'
import { Block, BlockType, makeBlock, labelFor, variantsFor } from '@/lib/blocks'
import { isWidget } from '@/lib/widgets'
import WidgetFields from '@/components/widgets/WidgetFields'
import { CATALOG, iconMap } from '@/components/widgets/catalog'

const ADD_TYPES: BlockType[] = CATALOG.map((c) => c.type)

export default function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (next: Block[]) => void }) {
  const [adding, setAdding] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    onChange(arrayMove(blocks, blocks.findIndex((b) => b.id === active.id), blocks.findIndex((b) => b.id === over.id)))
  }
  const update = (id: string, patch: Partial<Block>) => onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id))
  const add = (type: BlockType) => { onChange([...blocks, makeBlock(type)]); setAdding(false) }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} onUpdate={update} onRemove={remove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">No blocks yet. Add your first block below.</div>
      )}

      <div className="relative mt-3">
        <button type="button" onClick={() => setAdding((v) => !v)} className="btn-outline w-full"><Plus className="h-4 w-4" /> Add block</button>
        {adding && (
          <div className="absolute z-10 mt-2 grid max-h-80 w-full grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:grid-cols-3">
            {ADD_TYPES.map((type) => { const Icon = iconMap[type] || Plus; return (
              <button key={type} type="button" onClick={() => add(type)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" /> <span className="truncate">{labelFor(type)}</span>
              </button>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}

function SortableBlock({ block, onUpdate, onRemove }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="card flex gap-2 p-3">
      <button type="button" className="mt-1 h-fit cursor-grab touch-none rounded p-1 text-slate-300 hover:text-slate-500 active:cursor-grabbing" aria-label="Drag to reorder" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">{labelFor(block.type)}</span>
          <button type="button" onClick={() => onRemove(block.id)} className="btn-danger !px-2 !py-1" aria-label="Delete block"><Trash2 className="h-4 w-4" /></button>
        </div>
        <BlockFields block={block} onUpdate={onUpdate} />
        <StyleRow block={block} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

function StyleRow({ block: b, onUpdate }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void }) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)
  const variants = variantsFor(b.type)
  const hasAlign = ['hero', 'heading', 'paragraph', 'button'].includes(b.type)
  const hasBg = ['features', 'stats'].includes(b.type)
  if (variants.length === 0 && !hasAlign && !hasBg) return null
  return (
    <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
      {variants.length > 0 && (
        <label className="text-xs text-slate-500">Style
          <select className="input mt-1 !py-1 !text-xs capitalize" value={b.variant || variants[0]} onChange={(e) => set({ variant: e.target.value })}>
            {variants.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      )}
      {hasAlign && (
        <label className="text-xs text-slate-500">Align
          <select className="input mt-1 !py-1 !text-xs capitalize" value={b.align || 'left'} onChange={(e) => set({ align: e.target.value as any })}>
            <option value="left">left</option><option value="center">center</option>
          </select>
        </label>
      )}
      {hasBg && (
        <label className="text-xs text-slate-500">Background
          <select className="input mt-1 !py-1 !text-xs capitalize" value={b.bg || 'none'} onChange={(e) => set({ bg: e.target.value as any })}>
            <option value="none">none</option><option value="tint">tint</option>
          </select>
        </label>
      )}
    </div>
  )
}

function BlockFields({ block: b, onUpdate }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void }) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)
  const setFeature = (i: number, patch: Partial<{ title: string; text: string }>) => set({ features: (b.features || []).map((f, j) => j === i ? { ...f, ...patch } : f) })
  const setStat = (i: number, patch: Partial<{ value: string; label: string }>) => set({ stats: (b.stats || []).map((s, j) => j === i ? { ...s, ...patch } : s) })

  switch (b.type) {
    case 'hero':
      return (
        <div className="space-y-2">
          <input className="input" value={b.heading || ''} onChange={(e) => set({ heading: e.target.value })} placeholder="Hero heading" />
          <input className="input" value={b.subheading || ''} onChange={(e) => set({ subheading: e.target.value })} placeholder="Hero subheading" />
          <input className="input" value={b.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="Button label (optional)" />
          {(b.variant === 'image' || b.variant === 'split') && <input className="input" value={b.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="Image URL" />}
        </div>
      )
    case 'heading':
      return <input className="input" value={b.text || ''} onChange={(e) => set({ text: e.target.value })} placeholder="Heading text" />
    case 'paragraph':
      return <textarea className="input min-h-[80px]" value={b.text || ''} onChange={(e) => set({ text: e.target.value })} placeholder="Paragraph text" />
    case 'image':
      return (
        <div className="space-y-2">
          <input className="input" value={b.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="Image URL" />
          <input className="input" value={b.alt || ''} onChange={(e) => set({ alt: e.target.value })} placeholder="Alt text" />
        </div>
      )
    case 'button':
      return (
        <div className="grid grid-cols-2 gap-2">
          <input className="input" value={b.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="Button label" />
          <input className="input" value={b.href || ''} onChange={(e) => set({ href: e.target.value })} placeholder="Link (/blog, https://…)" />
        </div>
      )
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea className="input min-h-[60px]" value={b.text || ''} onChange={(e) => set({ text: e.target.value })} placeholder="Quote" />
          <input className="input" value={b.cite || ''} onChange={(e) => set({ cite: e.target.value })} placeholder="Attribution" />
        </div>
      )
    case 'features':
      return (
        <div className="space-y-2">
          <input className="input" value={b.heading || ''} onChange={(e) => set({ heading: e.target.value })} placeholder="Section heading (optional)" />
          {(b.features || []).map((f, i) => (
            <div key={i} className="flex gap-2 rounded-lg bg-slate-50 p-2">
              <div className="flex-1 space-y-1.5">
                <input className="input" value={f.title} onChange={(e) => setFeature(i, { title: e.target.value })} placeholder="Feature title" />
                <input className="input" value={f.text} onChange={(e) => setFeature(i, { text: e.target.value })} placeholder="Feature description" />
              </div>
              <button type="button" onClick={() => set({ features: (b.features || []).filter((_, j) => j !== i) })} className="btn-danger !px-2" aria-label="Remove"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => set({ features: [...(b.features || []), { title: 'New feature', text: 'Describe it.' }] })} className="btn-outline !py-1 text-xs"><Plus className="h-3.5 w-3.5" /> Add feature</button>
        </div>
      )
    case 'stats':
      return (
        <div className="space-y-2">
          {(b.stats || []).map((s, i) => (
            <div key={i} className="flex gap-2 rounded-lg bg-slate-50 p-2">
              <input className="input" value={s.value} onChange={(e) => setStat(i, { value: e.target.value })} placeholder="10k+" />
              <input className="input" value={s.label} onChange={(e) => setStat(i, { label: e.target.value })} placeholder="Label" />
              <button type="button" onClick={() => set({ stats: (b.stats || []).filter((_, j) => j !== i) })} className="btn-danger !px-2" aria-label="Remove"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => set({ stats: [...(b.stats || []), { value: '00', label: 'Label' }] })} className="btn-outline !py-1 text-xs"><Plus className="h-3.5 w-3.5" /> Add stat</button>
        </div>
      )
    case 'cta':
      return (
        <div className="space-y-2">
          <input className="input" value={b.heading || ''} onChange={(e) => set({ heading: e.target.value })} placeholder="CTA heading" />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" value={b.label || ''} onChange={(e) => set({ label: e.target.value })} placeholder="Button label" />
            <input className="input" value={b.href || ''} onChange={(e) => set({ href: e.target.value })} placeholder="Link" />
          </div>
        </div>
      )
    default:
      if (isWidget(b.type)) return <WidgetFields block={b} onUpdate={onUpdate} />
      return null
  }
}
