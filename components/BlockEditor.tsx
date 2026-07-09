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
import { GripVertical, Trash2, Plus, Type, Heading, Image as ImageIcon, MousePointerClick, Quote, LayoutTemplate } from 'lucide-react'
import { Block, BlockType, makeBlock, BLOCK_LABELS } from '@/lib/blocks'

const ADD_MENU: { type: BlockType; icon: any }[] = [
  { type: 'hero', icon: LayoutTemplate },
  { type: 'heading', icon: Heading },
  { type: 'paragraph', icon: Type },
  { type: 'image', icon: ImageIcon },
  { type: 'button', icon: MousePointerClick },
  { type: 'quote', icon: Quote },
]

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[]
  onChange: (next: Block[]) => void
}) {
  const [adding, setAdding] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    onChange(arrayMove(blocks, oldIndex, newIndex))
  }

  function update(id: string, patch: Partial<Block>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }
  function remove(id: string) {
    onChange(blocks.filter((b) => b.id !== id))
  }
  function add(type: BlockType) {
    onChange([...blocks, makeBlock(type)])
    setAdding(false)
  }

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
        <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
          No blocks yet. Add your first block below.
        </div>
      )}

      <div className="relative mt-3">
        <button type="button" onClick={() => setAdding((v) => !v)} className="btn-outline w-full">
          <Plus className="h-4 w-4" /> Add block
        </button>
        {adding && (
          <div className="absolute z-10 mt-2 grid w-full grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:grid-cols-3">
            {ADD_MENU.map(({ type, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => add(type)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Icon className="h-4 w-4 text-slate-400" /> {BLOCK_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SortableBlock({
  block,
  onUpdate,
  onRemove,
}: {
  block: Block
  onUpdate: (id: string, patch: Partial<Block>) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="card flex gap-2 p-3">
      <button
        type="button"
        className="mt-1 h-fit cursor-grab touch-none rounded p-1 text-slate-300 hover:text-slate-500 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {BLOCK_LABELS[block.type]}
          </span>
          <button type="button" onClick={() => onRemove(block.id)} className="btn-danger !px-2 !py-1" aria-label="Delete block">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <BlockFields block={block} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

function BlockFields({
  block: b,
  onUpdate,
}: {
  block: Block
  onUpdate: (id: string, patch: Partial<Block>) => void
}) {
  const set = (patch: Partial<Block>) => onUpdate(b.id, patch)

  switch (b.type) {
    case 'hero':
      return (
        <div className="space-y-2">
          <input className="input" value={b.heading || ''} onChange={(e) => set({ heading: e.target.value })} placeholder="Hero heading" />
          <input className="input" value={b.subheading || ''} onChange={(e) => set({ subheading: e.target.value })} placeholder="Hero subheading" />
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
          {b.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.url} alt="" className="h-28 w-full rounded-lg object-cover" />
          )}
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
    default:
      return null
  }
}
