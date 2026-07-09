// Content blocks power the drag-and-drop page builder and the public renderer.
// A single flexible shape keeps the editor simple; each type uses the fields it needs.

export type BlockType = 'hero' | 'heading' | 'paragraph' | 'image' | 'button' | 'quote'

export interface Block {
  id: string
  type: BlockType
  // text-bearing blocks (heading, paragraph, quote)
  text?: string
  // hero
  heading?: string
  subheading?: string
  // image
  url?: string
  alt?: string
  // button
  label?: string
  href?: string
  // quote
  cite?: string
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  heading: 'Heading',
  paragraph: 'Paragraph',
  image: 'Image',
  button: 'Button',
  quote: 'Quote',
}

export function blockId(): string {
  return 'blk_' + Math.random().toString(36).slice(2, 9)
}

export function makeBlock(type: BlockType): Block {
  const id = blockId()
  switch (type) {
    case 'hero':
      return { id, type, heading: 'Your headline goes here', subheading: 'A short supporting sentence that sets the scene.' }
    case 'heading':
      return { id, type, text: 'Section heading' }
    case 'paragraph':
      return { id, type, text: 'Write your content here. This paragraph renders exactly as visitors will see it on the live page.' }
    case 'image':
      return { id, type, url: 'https://picsum.photos/seed/' + id + '/1200/600', alt: 'Descriptive alt text' }
    case 'button':
      return { id, type, label: 'Learn more', href: '#' }
    case 'quote':
      return { id, type, text: 'A memorable quote that adds credibility.', cite: 'Jane Doe, Acme' }
    default:
      return { id, type: 'paragraph', text: '' }
  }
}
