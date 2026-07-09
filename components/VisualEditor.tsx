'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, useDraggable, useDroppable, DragEndEvent, DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Trash2, Plus, Copy, ChevronUp, ChevronDown, Maximize2, Minimize2,
  Eye, Save, Sliders, Check, X, Search, LayoutTemplate,
} from 'lucide-react'
import { Block, BlockType, makeBlock, blockId, labelFor, variantsFor, themeVars } from '@/lib/blocks'
import { isWidget } from '@/lib/widgets'
import WidgetRenderer from '@/components/widgets/WidgetRenderer'
import WidgetFields from '@/components/widgets/WidgetFields'
import { CATALOG, catalogByCategory, iconMap, CATALOG_COUNT } from '@/components/widgets/catalog'

const ALL_TYPES: BlockType[] = CATALOG.map((c) => c.type)

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
  const [paletteDrag, setPaletteDrag] = useState<BlockType | null>(null)
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
  const append = (type: BlockType) => insertAt(blocks.length, type)

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (id.startsWith('new:')) setPaletteDrag(id.slice(4) as BlockType)
  }
  function onDragEnd(e: DragEndEvent) {
    const activeId = String(e.active.id)
    const overId = e.over ? String(e.over.id) : ''
    setPaletteDrag(null)

    if (activeId.startsWith('new:')) {
      const type = activeId.slice(4) as BlockType
      let index = blocks.length
      if (overId.startsWith('slot:')) index = parseInt(overId.slice(5), 10)
      else { const bi = blocks.findIndex((b) => b.id === overId); if (bi >= 0) index = bi }
      insertAt(index, type)
      return
    }
    // reorder existing blocks
    if (overId && activeId !== overId) {
      const from = blocks.findIndex((b) => b.id === activeId)
      const to = blocks.findIndex((b) => b.id === overId)
      if (from >= 0 && to >= 0) onChange(arrayMove(blocks, from, to))
    }
  }

  const canvasInner = (dropSlots: boolean) => (
    <div style={themeVars(theme) as React.CSSProperties} onClick={() => setSelected(null)}>
      {dropSlots ? <DropSlot index={0} active={!!paletteDrag} /> : <InsertBar onPick={(t) => insertAt(0, t)} />}
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((block, i) => (
          <div key={block.id}>
            <SortableVisualBlock
              block={block} selected={selected === block.id} first={i === 0} last={i === blocks.length - 1}
              onSelect={() => setSelected(block.id)} onUpdate={update} onRemove={remove} onDuplicate={duplicate} onMove={move}
            />
            {dropSlots ? <DropSlot index={i + 1} active={!!paletteDrag} /> : <InsertBar onPick={(t) => insertAt(i + 1, t)} />}
          </div>
        ))}
      </SortableContext>
      {blocks.length === 0 && (
        <div className="py-16 text-center text-sm text-slate-400">
          {dropSlots ? 'Drag a widget from the left onto the canvas.' : <>Empty page. Use the <span className="font-medium text-slate-600">+</span> above to add your first block.</>}
        </div>
      )}
    </div>
  )

  // ── Fullscreen: Elementor-style two-pane ──
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <LayoutTemplate className="h-4 w-4 text-brand-600" /> Visual editor
          </div>
          <div className="flex items-center gap-2">
            {onPreview && <button onClick={onPreview} disabled={saving} className="btn-outline !py-1.5"><Eye className="h-4 w-4" /> Preview</button>}
            {onSave && <button onClick={onSave} disabled={saving} className="btn-primary !py-1.5"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}</button>}
            <button onClick={() => setFullscreen(false)} className="btn-ghost !py-1.5"><Minimize2 className="h-4 w-4" /> Exit</button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex min-h-0 flex-1">
            <WidgetPanel onAdd={append} />
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {canvasInner(true)}
              </div>
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {paletteDrag ? (
              <div className="flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-lg">
                {(() => { const I = iconMap[paletteDrag] || Plus; return <I className="h-4 w-4 text-brand-600" /> })()} {labelFor(paletteDrag)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    )
  }

  // ── Inline: compact editor ──
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ChromeBar onFullscreen={() => setFullscreen(true)} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {canvasInner(false)}
      </DndContext>
    </div>
  )
}

/* ── Left widget panel (Elementor-style) ── */
function WidgetPanel({ onAdd }: { onAdd: (t: BlockType) => void }) {
  const [q, setQ] = useState('')
  const groups = catalogByCategory(q)
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="border-b border-slate-100 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${CATALOG_COUNT} widgets…`} className="input !pl-9" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {groups.map((cat) => (
          <div key={cat.label} className="mb-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{cat.label}</span>
              <span className="text-[10px] text-slate-300">{cat.items.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cat.items.map((it) => <WidgetTile key={it.type} type={it.type} onAdd={onAdd} />)}
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="px-1 text-sm text-slate-400">No widgets match “{q}”.</p>}
        <p className="px-1 text-xs text-slate-400">Drag a widget onto the canvas, or click to add it.</p>
      </div>
    </aside>
  )
}

function WidgetTile({ type, onAdd }: { type: BlockType; onAdd: (t: BlockType) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `new:${type}` })
  const Icon = iconMap[type] || Plus
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onAdd(type)}
      className={`flex cursor-grab flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
    >
      <Icon className="h-5 w-5 text-slate-500" />
      <span className="text-[11px] font-medium leading-tight text-slate-600">{labelFor(type)}</span>
    </button>
  )
}

/* ── Drop slot between blocks (fullscreen) ── */
function DropSlot({ index, active }: { index: number; active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${index}` })
  return (
    <div ref={setNodeRef} className={`transition-all ${active ? 'h-14 py-2' : 'h-0'}`} onClick={(e) => e.stopPropagation()}>
      {active && (
        <div className={`mx-6 flex h-full items-center justify-center rounded-lg border-2 border-dashed text-xs font-medium transition-colors ${isOver ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-400'}`}>
          Drop here
        </div>
      )}
    </div>
  )
}

function ChromeBar({ onFullscreen }: { onFullscreen: () => void }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      <span className="ml-3 hidden text-xs text-slate-400 sm:inline">Live preview — click to edit, drag to reorder</span>
      <button onClick={onFullscreen} className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-800" title="Edit in full screen (widget panel)">
        <Maximize2 className="h-3.5 w-3.5" /> Full screen
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
        <div className="absolute top-4 z-30 grid max-h-72 grid-cols-3 gap-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {ALL_TYPES.map((type) => { const Icon = iconMap[type] || Plus; return (
            <button key={type} onClick={() => { onPick(type); setOpen(false) }} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50">
              <Icon className="h-4 w-4 shrink-0 text-slate-400" /> <span className="truncate">{labelFor(type)}</span>
            </button>
          )})}
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
  const settingsOpen = showSettings || (selected && isWidget(block.type))

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
      <span className="absolute left-2 top-2 z-20 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition-opacity group-hover/block:opacity-100">{labelFor(block.type)}</span>

      <EditableBlock block={block} onUpdate={onUpdate} />

      {settingsOpen && (
        <div className="border-t border-slate-200 bg-slate-50 p-4" onClick={(e) => e.stopPropagation()}>
          <SettingsPanel block={block} onUpdate={onUpdate} onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  )
}

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
            <span className="mt-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold text-white" style={grad}>
              <Line value={b.label || ''} onChange={(v) => set({ label: v })} placeholder="Button label" className="text-center text-white placeholder:text-white/60" />
            </span>
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
      if (isWidget(b.type)) return <div className="[&_a]:pointer-events-none [&_button]:pointer-events-none [&_iframe]:pointer-events-none [&_input]:pointer-events-none">{<WidgetRenderer block={b} />}</div>
      return null
  }
}

function SettingsPanel({ block: b, onUpdate, onClose }: { block: Block; onUpdate: (id: string, patch: Partial<Block>) => void; onClose: () => void }) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)
  if (isWidget(b.type)) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">{labelFor(b.type)} settings</span>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-200"><X className="h-4 w-4" /></button>
        </div>
        <WidgetFields block={b} onUpdate={onUpdate} />
      </div>
    )
  }
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
        <div><div className="mb-1 text-xs font-medium text-slate-500">Style</div>
          <div className="flex flex-wrap gap-1.5">{variants.map((v) => (
            <button key={v} onClick={() => set({ variant: v })} className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${b.variant === v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>{v}</button>
          ))}</div>
        </div>
      )}
      {hasAlign && (
        <div><div className="mb-1 text-xs font-medium text-slate-500">Alignment</div>
          <div className="flex gap-1.5">{(['left', 'center'] as const).map((a) => (
            <button key={a} onClick={() => set({ align: a })} className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${(b.align || 'left') === a ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>{a}</button>
          ))}</div>
        </div>
      )}
      {hasBg && (
        <div><div className="mb-1 text-xs font-medium text-slate-500">Background</div>
          <div className="flex gap-1.5">{(['none', 'tint'] as const).map((g) => (
            <button key={g} onClick={() => set({ bg: g })} className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${(b.bg || 'none') === g ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>{g}</button>
          ))}</div>
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
        <div><div className="mb-1 text-xs font-medium text-slate-500">Features ({(b.features || []).length})</div>
          <div className="flex flex-wrap gap-1.5">
            {(b.features || []).map((_, i) => (<button key={i} onClick={() => rmFeature(i)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-red-300 hover:text-red-600">Item {i + 1} <X className="h-3 w-3" /></button>))}
            <button onClick={addFeature} className="rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-white"><Plus className="mr-1 inline h-3 w-3" />Add</button>
          </div>
        </div>
      )}
      {b.type === 'stats' && (
        <div><div className="mb-1 text-xs font-medium text-slate-500">Stats ({(b.stats || []).length})</div>
          <div className="flex flex-wrap gap-1.5">
            {(b.stats || []).map((_, i) => (<button key={i} onClick={() => rmStat(i)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-red-300 hover:text-red-600">Stat {i + 1} <X className="h-3 w-3" /></button>))}
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
