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
  GripVertical, Trash2, Plus, Copy, ChevronUp, ChevronDown,
  Type, Heading, Image as ImageIcon, MousePointerClick, Quote, LayoutTemplate,
} from 'lucide-react'
import { Block, BlockType, makeBlock, blockId, BLOCK_LABELS } from '@/lib/blocks'

const ADD_MENU: { type: BlockType; icon: any }[] = [
  { type: 'hero', icon: LayoutTemplate },
  { type: 'heading', icon: Heading },
  { type: 'paragraph', icon: Type },
  { type: 'image', icon: ImageIcon },
  { type: 'button', icon: MousePointerClick },
  { type: 'quote', icon: Quote },
]

export default function VisualEditor({
  blocks,
  onChange,
}: {
  blocks: Block[]
  onChange: (next: Block[]) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    onChange(arrayMove(blocks, blocks.findIndex((b) => b.id === active.id), blocks.findIndex((b) => b.id === over.id)))
  }

  const update = (id: string, patch: Partial<Block>) => onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const remove = (id: string) => { onChange(blocks.filter((b) => b.id !== id)); setSelected(null) }
  const duplicate = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id)
    if (i < 0) return
    const copy = { ...blocks[i], id: blockId() }
    const next = [...blocks]; next.splice(i + 1, 0, copy); onChange(next)
  }
  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= blocks.length) return
    onChange(arrayMove(blocks, i, j))
  }
  const insertAt = (index: number, type: BlockType) => {
    const next = [...blocks]; const nb = makeBlock(type); next.splice(index, 0, nb); onChange(next); setSelected(nb.id)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" onClick={() => setSelected(null)}>
      {/* Fake browser chrome to signal "this is your live page" */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-3 text-xs text-slate-400">Live preview — click any element to edit, drag to reorder</span>
      </div>

      <div className="min-h-[300px]">
        <InsertBar onPick={(t) => insertAt(0, t)} />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, i) => (
              <div key={block.id}>
                <SortableVisualBlock
                  block={block}
                  selected={selected === block.id}
                  first={i === 0}
                  last={i === blocks.length - 1}
                  onSelect={() => setSelected(block.id)}
                  onUpdate={update}
                  onRemove={remove}
                  onDuplicate={duplicate}
                  onMove={move}
                />
                <InsertBar onPick={(t) => insertAt(i + 1, t)} />
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {blocks.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-400">
            Empty page. Use the <span className="font-medium text-slate-600">+</span> above to add your first block.
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Insert bar between blocks ── */
function InsertBar({ onPick }: { onPick: (t: BlockType) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="group relative flex h-0 items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="z-10 -my-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 opacity-0 shadow-sm transition-all hover:border-brand-400 hover:text-brand-600 group-hover:opacity-100"
        aria-label="Insert block"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute top-4 z-20 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {ADD_MENU.map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => { onPick(type); setOpen(false) }}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Icon className="h-4 w-4 text-slate-400" /> {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sortable, selectable block wrapper with floating toolbar ── */
function SortableVisualBlock({
  block, selected, first, last, onSelect, onUpdate, onRemove, onDuplicate, onMove,
}: {
  block: Block
  selected: boolean
  first: boolean
  last: boolean
  onSelect: () => void
  onUpdate: (id: string, patch: Partial<Block>) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      className={`group/block relative outline-offset-[-2px] transition-shadow ${
        selected ? 'outline outline-2 outline-brand-500' : 'hover:outline hover:outline-2 hover:outline-brand-200'
      }`}
    >
      {/* Floating toolbar */}
      <div
        className={`absolute right-2 top-2 z-20 flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-0.5 shadow-md backdrop-blur transition-opacity ${
          selected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cursor-grab touch-none rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing" aria-label="Drag" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <button disabled={first} onClick={() => onMove(block.id, -1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
        <button disabled={last} onClick={() => onMove(block.id, 1)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
        <button onClick={() => onDuplicate(block.id)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
        <button onClick={() => onRemove(block.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>

      <span className="absolute left-2 top-2 z-20 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition-opacity group-hover/block:opacity-100">
        {BLOCK_LABELS[block.type]}
      </span>

      <EditableBlock block={block} selected={selected} onUpdate={onUpdate} />
    </div>
  )
}

/* ── Auto-growing textarea styled to look like rendered text ── */
function AutoText({
  value, onChange, className, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`w-full resize-none overflow-hidden border-0 bg-transparent p-0 focus:outline-none focus:ring-0 ${className || ''}`}
    />
  )
}

/* ── The visual, inline-editable rendering of each block ── */
function EditableBlock({
  block: b, selected, onUpdate,
}: {
  block: Block
  selected: boolean
  onUpdate: (id: string, patch: Partial<Block>) => void
}) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)

  switch (b.type) {
    case 'hero':
      return (
        <section className="relative overflow-hidden bg-ink-950 px-6 py-20 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-brand-600/40 blur-3xl" />
            <div className="absolute right-0 top-8 h-64 w-64 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="absolute inset-0 grid-dots opacity-40" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <AutoText value={b.heading || ''} onChange={(v) => set({ heading: v })} placeholder="Hero heading" className="site-heading text-center text-3xl font-bold leading-tight text-white placeholder:text-white/40 sm:text-5xl" />
            <AutoText value={b.subheading || ''} onChange={(v) => set({ subheading: v })} placeholder="Supporting subheading" className="mt-4 text-center text-lg text-slate-300 placeholder:text-slate-500" />
          </div>
        </section>
      )

    case 'heading':
      return (
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand-500 to-accent-500" />
            <AutoText value={b.text || ''} onChange={(v) => set({ text: v })} placeholder="Section heading" className="site-heading text-3xl font-bold text-slate-900 placeholder:text-slate-300 sm:text-4xl" />
          </div>
        </div>
      )

    case 'paragraph':
      return (
        <div className="mx-auto max-w-3xl px-6 py-4">
          <AutoText value={b.text || ''} onChange={(v) => set({ text: v })} placeholder="Write a paragraph…" className="text-lg leading-8 text-slate-600 placeholder:text-slate-300" />
        </div>
      )

    case 'image':
      return (
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-900/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.url} alt={b.alt || ''} className="aspect-[16/9] w-full object-cover" />
          </div>
          {selected && (
            <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3" onClick={(e) => e.stopPropagation()}>
              <input className="input" value={b.url || ''} onChange={(e) => set({ url: e.target.value })} placeholder="Image URL" />
              <input className="input" value={b.alt || ''} onChange={(e) => set({ alt: e.target.value })} placeholder="Alt text" />
            </div>
          )}
        </div>
      )

    case 'button':
      return (
        <div className="mx-auto max-w-3xl px-6 py-6">
          <span className="cta">
            <input
              value={b.label || ''}
              onChange={(e) => set({ label: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Button label"
              className="border-0 bg-transparent p-0 text-center text-sm font-semibold text-white placeholder:text-white/60 focus:outline-none focus:ring-0"
              style={{ width: `${Math.max((b.label || 'Button').length, 6)}ch` }}
            />
          </span>
          {selected && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3" onClick={(e) => e.stopPropagation()}>
              <input className="input" value={b.href || ''} onChange={(e) => set({ href: e.target.value })} placeholder="Link destination (/blog, https://…)" />
            </div>
          )}
        </div>
      )

    case 'quote':
      return (
        <div className="mx-auto max-w-3xl px-6 py-8">
          <figure className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/50 p-8">
            <span aria-hidden className="site-heading pointer-events-none absolute left-4 top-1 text-6xl text-brand-200">“</span>
            <AutoText value={b.text || ''} onChange={(v) => set({ text: v })} placeholder="Quote text" className="site-heading relative text-2xl font-medium leading-snug text-slate-900 placeholder:text-slate-300" />
            <input value={b.cite || ''} onChange={(e) => set({ cite: e.target.value })} onClick={(e) => e.stopPropagation()} placeholder="Attribution" className="mt-3 w-full border-0 bg-transparent p-0 text-sm font-medium text-brand-600 placeholder:text-slate-300 focus:outline-none focus:ring-0" />
          </figure>
        </div>
      )

    default:
      return null
  }
}
