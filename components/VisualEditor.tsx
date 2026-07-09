'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Trash2, Plus, Copy, ChevronUp, ChevronDown, Maximize2, Minimize2,
  Eye, Save, Sliders, Check, X,
  Type, Heading, Image as ImageIcon, MousePointerClick, Quote, LayoutTemplate, Grid3x3, BarChart3, Megaphone,
} from 'lucide-react'
import { Block, BlockType, makeBlock, blockId, BLOCK_LABELS, variantsFor, themeVars } from '@/lib/blocks'

const ADD_MENU: { type: BlockType; icon: any }[] = [
  { type: 'hero', icon: LayoutTemplate },
  { type: 'heading', icon: Heading },
  { type: 'paragraph', icon: Type },
  { type: 'image', icon: ImageIcon },
  { type: 'button', icon: MousePointerClick },
  { type: 'quote', icon: Quote },
  { type: 'features', icon: Grid3x3 },
  { type: 'stats', icon: BarChart3 },
  { type: 'cta', icon: Megaphone },
]

export default function VisualEditor({
  blocks, onChange, theme, onSave, onPreview, saving,
}: {
  blocks: Block[]
  onChange: (next: Block[]) => void
  theme?: string
  onSave?: () => void
  onPreview?: () => void
  saving?: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [fullscreen])

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    onChange(arrayMove(blocks, blocks.findIndex((b) => b.id === active.id), blocks.findIndex((b) => b.id === over.id)))
  }
  const update = (id: string, patch: Partial<Block>) => onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const remove = (id: string) => { onChange(blocks.filter((b) => b.id !== id)); setSelected(null) }
  const duplicate = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id); if (i < 0) return
    const next = [...blocks]; next.splice(i + 1, 0, { ...blocks[i], id: blockId() }); onChange(next)
  }
  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id); const j = i + dir
    if (i < 0 || j < 0 || j >= blocks.length) return
    onChange(arrayMove(blocks, i, j))
  }
  const insertAt = (index: number, type: BlockType) => {
    const next = [...blocks]; const nb = makeBlock(type); next.splice(index, 0, nb); onChange(next); setSelected(nb.id)
  }

  const canvas = (
    <div className="min-h-[300px]" style={themeVars(theme) as React.CSSProperties} onClick={() => setSelected(null)}>
      <InsertBar onPick={(t) => insertAt(0, t)} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, i) => (
            <div key={block.id}>
              <SortableVisualBlock
                block={block} selected={selected === block.id} first={i === 0} last={i === blocks.length - 1}
                onSelect={() => setSelected(block.id)} onUpdate={update} onRemove={remove} onDuplicate={duplicate} onMove={move}
              />
              <InsertBar onPick={(t) => insertAt(i + 1, t)} />
            </div>
          ))}
        </SortableContext>
      </DndContext>
      {blocks.length === 0 && (
        <div className="py-16 text-center text-sm text-slate-400">Empty page. Use the <span className="font-medium text-slate-600">+</span> above to add your first block.</div>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <LayoutTemplate className="h-4 w-4 text-brand-600" /> Visual editor
            <span className="hidden text-xs font-normal text-slate-400 sm:inline">— click to edit, drag to reorder</span>
          </div>
          <div className="flex items-center gap-2">
            {onPreview && <button onClick={onPreview} disabled={saving} className="btn-outline !py-1.5"><Eye className="h-4 w-4" /> Preview</button>}
            {onSave && <button onClick={onSave} disabled={saving} className="btn-primary !py-1.5"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}</button>}
            <button onClick={() => setFullscreen(false)} className="btn-ghost !py-1.5"><Minimize2 className="h-4 w-4" /> Exit</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <ChromeBar onFullscreen={() => setFullscreen(false)} fullscreen />
            {canvas}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ChromeBar onFullscreen={() => setFullscreen(true)} />
      {canvas}
    </div>
  )
}

function ChromeBar({ onFullscreen, fullscreen }: { onFullscreen: () => void; fullscreen?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="ml-3 hidden text-xs text-slate-400 sm:inline">Live preview — click any element to edit, drag to reorder</span>
      <button onClick={onFullscreen} className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-800" title={fullscreen ? 'Exit full screen' : 'Edit in full screen'}>
        {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />} {fullscreen ? 'Exit' : 'Full screen'}
      </button>
    </div>
  )
}

function InsertBar({ onPick }: { onPick: (t: BlockType) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="group relative flex h-0 items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen((v) => !v)} className="z-10 -my-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 opacity-0 shadow-sm transition-all hover:border-brand-400 hover:text-brand-600 group-hover:opacity-100" aria-label="Insert block">
        <Plus className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute top-4 z-30 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {ADD_MENU.map(({ type, icon: Icon }) => (
            <button key={type} onClick={() => { onPick(type); setOpen(false) }} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <Icon className="h-4 w-4 text-slate-400" /> {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SortableVisualBlock({
  block, selected, first, last, onSelect, onUpdate, onRemove, onDuplicate, onMove,
}: {
  block: Block; selected: boolean; first: boolean; last: boolean
  onSelect: () => void
  onUpdate: (id: string, patch: Partial<Block>) => void
  onRemove: (id: string) => void; onDuplicate: (id: string) => void; onMove: (id: string, dir: -1 | 1) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div ref={setNodeRef} style={style} onClick={(e) => { e.stopPropagation(); onSelect() }}
      className={`group/block relative outline-offset-[-2px] transition-shadow ${selected ? 'outline outline-2 outline-brand-500' : 'hover:outline hover:outline-2 hover:outline-brand-200'}`}>
      <div className={`absolute right-2 top-2 z-20 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-0.5 shadow-md backdrop-blur transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'}`} onClick={(e) => e.stopPropagation()}>
        <button className="cursor-grab touch-none rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing" aria-label="Drag" {...attributes} {...listeners}><GripVertical className="h-4 w-4" /></button>
        <button onClick={() => setShowSettings((v) => !v)} className={`rounded p-1.5 hover:bg-slate-100 ${showSettings ? 'text-brand-600' : 'text-slate-400 hover:text-slate-700'}`} aria-label="Style"><Sliders className="h-4 w-4" /></button>
        <button disabled={first} onClick={() => onMove(block.id, -1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
        <button disabled={last} onClick={() => onMove(block.id, 1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
        <button onClick={() => onDuplicate(block.id)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
        <button onClick={() => onRemove(block.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>
      <span className="absolute left-2 top-2 z-20 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition-opacity group-hover/block:opacity-100">{BLOCK_LABELS[block.type]}</span>

      <EditableBlock block={block} onUpdate={onUpdate} />

      {showSettings && (
        <div className="border-t border-slate-200 bg-slate-50 p-4" onClick={(e) => e.stopPropagation()}>
          <SettingsPanel block={block} onUpdate={onUpdate} onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  )
}

/* ── inline editors ── */
function AutoText({ value, onChange, className, placeholder }: { value: string; onChange: (v: string) => void; className?: string; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { const el = ref.current; if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' } }, [value])
  return (
    <textarea ref={ref} rows={1} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onClick={(e) => e.stopPropagation()}
      className={`w-full resize-none overflow-hidden border-0 bg-transparent p-0 focus:outline-none focus:ring-0 ${className || ''}`} />
  )
}
function Line({ value, onChange, className, placeholder }: { value: string; onChange: (v: string) => void; className?: string; placeholder?: string }) {
  return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onClick={(e) => e.stopPropagation()} className={`w-full border-0 bg-transparent p-0 focus:outline-none focus:ring-0 ${className || ''}`} />
}

const grad = { backgroundImage: 'linear-gradient(120deg, var(--from), var(--to))' }
const tintBg = { backgroundColor: 'var(--tint)' }

function EditableBlock({ block: b, onUpdate }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void }) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)
  const setFeature = (i: number, patch: Partial<{ title: string; text: string }>) => set({ features: (b.features || []).map((f, j) => j === i ? { ...f, ...patch } : f) })
  const setStat = (i: number, patch: Partial<{ value: string; label: string }>) => set({ stats: (b.stats || []).map((s, j) => j === i ? { ...s, ...patch } : s) })

  switch (b.type) {
    case 'hero': {
      const light = b.variant === 'light'
      return (
        <section className="relative overflow-hidden px-6 py-16 text-center" style={light ? tintBg : { backgroundColor: '#0b1120' }}>
          {!light && (
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 top-0 h-64 w-64 rounded-full opacity-50 blur-3xl" style={{ backgroundColor: 'var(--from)' }} />
              <div className="absolute right-0 top-8 h-64 w-64 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: 'var(--to)' }} />
            </div>
          )}
          <div className="relative mx-auto max-w-2xl">
            <AutoText value={b.heading || ''} onChange={(v) => set({ heading: v })} placeholder="Hero heading" className={`site-heading text-center text-3xl font-bold leading-tight sm:text-5xl ${light ? 'text-slate-900 placeholder:text-slate-300' : 'text-white placeholder:text-white/40'}`} />
            <AutoText value={b.subheading || ''} onChange={(v) => set({ subheading: v })} placeholder="Supporting subheading" className={`mt-4 text-center text-lg ${light ? 'text-slate-600 placeholder:text-slate-400' : 'text-slate-300 placeholder:text-slate-500'}`} />
            {(b.label || b.label === '') && (
              <span className="mt-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold text-white" style={grad}>
                <Line value={b.label || ''} onChange={(v) => set({ label: v })} placeholder="Button label" className="text-center text-white placeholder:text-white/60" />
              </span>
            )}
          </div>
        </section>
      )
    }
    case 'heading':
      return (
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 shrink-0 rounded-full" style={grad} />
            <AutoText value={b.text || ''} onChange={(v) => set({ text: v })} placeholder="Section heading" className="site-heading text-3xl font-bold text-slate-900 placeholder:text-slate-300 sm:text-4xl" />
          </div>
        </div>
      )
    case 'paragraph':
      return <div className="mx-auto max-w-3xl px-6 py-4"><AutoText value={b.text || ''} onChange={(v) => set({ text: v })} placeholder="Write a paragraph…" className="text-lg leading-8 text-slate-600 placeholder:text-slate-300" /></div>
    case 'image':
      return (
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-900/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt={b.alt || ''} className="aspect-[16/9] w-full object-cover" />
          </div>
        </div>
      )
    case 'button':
      return (
        <div className="mx-auto max-w-3xl px-6 py-6">
          <span className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white" style={grad}>
            <Line value={b.label || ''} onChange={(v) => set({ label: v })} placeholder="Button label" className="text-center text-white placeholder:text-white/60" />
          </span>
        </div>
      )
    case 'quote':
      return (
        <div className="mx-auto max-w-3xl px-6 py-8">
          <figure className="relative rounded-2xl p-8" style={tintBg}>
            <AutoText value={b.text || ''} onChange={(v) => set({ text: v })} placeholder="Quote text" className="site-heading text-2xl font-medium leading-snug text-slate-900 placeholder:text-slate-300" />
            <Line value={b.cite || ''} onChange={(v) => set({ cite: v })} placeholder="Attribution" className="mt-3 text-sm font-medium" />
          </figure>
        </div>
      )
    case 'features':
      return (
        <section className="px-6 py-10" style={b.bg === 'tint' ? tintBg : undefined}>
          <div className="mx-auto max-w-5xl">
            <AutoText value={b.heading || ''} onChange={(v) => set({ heading: v })} placeholder="Section heading (optional)" className="site-heading mb-6 text-center text-2xl font-bold text-slate-900 placeholder:text-slate-300 sm:text-3xl" />
            <div className="grid gap-4 sm:grid-cols-3">
              {(b.features || []).map((f, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={grad}><Check className="h-4 w-4" /></span>
                  <Line value={f.title} onChange={(v) => setFeature(i, { title: v })} placeholder="Title" className="site-heading mt-3 text-base font-bold text-slate-900 placeholder:text-slate-300" />
                  <AutoText value={f.text} onChange={(v) => setFeature(i, { text: v })} placeholder="Description" className="mt-1 text-sm text-slate-500 placeholder:text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'stats':
      return (
        <section className="px-6 py-10" style={b.bg === 'tint' ? tintBg : undefined}>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {(b.stats || []).map((s, i) => (
              <div key={i} className="text-center">
                <Line value={s.value} onChange={(v) => setStat(i, { value: v })} placeholder="10k+" className="site-heading text-center text-4xl font-bold" />
                <Line value={s.label} onChange={(v) => setStat(i, { label: v })} placeholder="Label" className="mt-1 text-center text-sm font-medium text-slate-500 placeholder:text-slate-300" />
              </div>
            ))}
          </div>
        </section>
      )
    case 'cta':
      return (
        <div className="px-6 py-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl px-8 py-12 text-center" style={b.variant === 'dark' ? { backgroundColor: '#0b1120' } : grad}>
            <AutoText value={b.heading || ''} onChange={(v) => set({ heading: v })} placeholder="Call-to-action heading" className="site-heading text-center text-2xl font-bold text-white placeholder:text-white/50 sm:text-3xl" />
            <span className="mt-5 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900">
              <Line value={b.label || ''} onChange={(v) => set({ label: v })} placeholder="Button label" className="text-center text-slate-900 placeholder:text-slate-400" />
            </span>
          </div>
        </div>
      )
    default:
      return null
  }
}

/* ── style + settings panel ── */
function SettingsPanel({ block: b, onUpdate, onClose }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void; onClose: () => void }) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)
  const variants = variantsFor(b.type)
  const hasAlign = ['hero', 'heading', 'paragraph', 'button'].includes(b.type)
  const hasBg = ['features', 'stats'].includes(b.type)

  const addFeature = () => set({ features: [...(b.features || []), { title: 'New feature', text: 'Describe it here.' }] })
  const rmFeature = (i: number) => set({ features: (b.features || []).filter((_, j) => j !== i) })
  const addStat = () => set({ stats: [...(b.stats || []), { value: '00', label: 'Label' }] })
  const rmStat = (i: number) => set({ stats: (b.stats || []).filter((_, j) => j !== i) })

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Block style</span>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-200"><X className="h-4 w-4" /></button>
      </div>

      {variants.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Style</div>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => (
              <button key={v} onClick={() => set({ variant: v })} className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${b.variant === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>{v}</button>
            ))}
          </div>
        </div>
      )}

      {hasAlign && (
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Alignment</div>
          <div className="flex gap-1.5">
            {(['left', 'center'] as const).map((a) => (
              <button key={a} onClick={() => set({ align: a })} className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${(b.align || 'left') === a ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>{a}</button>
            ))}
          </div>
        </div>
      )}

      {hasBg && (
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Background</div>
          <div className="flex gap-1.5">
            {(['none', 'tint'] as const).map((g) => (
              <button key={g} onClick={() => set({ bg: g })} className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${(b.bg || 'none') === g ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>{g}</button>
            ))}
          </div>
        </div>
      )}

      {(b.type === 'hero' && (b.variant === 'image' || b.variant === 'split')) && (
        <Field label="Image URL"><input className="input" value={b.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://…" /></Field>
      )}
      {b.type === 'image' && (
        <>
          <Field label="Image URL"><input className="input" value={b.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Alt text"><input className="input" value={b.alt || ''} onChange={(e) => set({ alt: e.target.value })} /></Field>
        </>
      )}
      {(b.type === 'button' || b.type === 'hero' || b.type === 'cta') && (
        <Field label="Button link"><input className="input" value={b.href || ''} onChange={(e) => set({ href: e.target.value })} placeholder="/blog, https://…" /></Field>
      )}

      {b.type === 'features' && (
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Features ({(b.features || []).length})</div>
          <div className="flex flex-wrap gap-1.5">
            {(b.features || []).map((_, i) => (
              <button key={i} onClick={() => rmFeature(i)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-red-300 hover:text-red-600">Item {i + 1} <X className="h-3 w-3" /></button>
            ))}
            <button onClick={addFeature} className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-white"><Plus className="mr-1 inline h-3 w-3" />Add</button>
          </div>
        </div>
      )}
      {b.type === 'stats' && (
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">Stats ({(b.stats || []).length})</div>
          <div className="flex flex-wrap gap-1.5">
            {(b.stats || []).map((_, i) => (
              <button key={i} onClick={() => rmStat(i)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-red-300 hover:text-red-600">Stat {i + 1} <X className="h-3 w-3" /></button>
            ))}
            <button onClick={addStat} className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-white"><Plus className="mr-1 inline h-3 w-3" />Add</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-1 text-xs font-medium text-slate-500">{label}</div>{children}</div>
}
