import type { ReactNode } from 'react'
import { CopyBlock } from '@ui/domain/copy-block'

// Parse inline formatting: **bold**, *italic*, `code`, [link](url)
function parseInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(<code key={key++} style={{ background: 'var(--bg-elevated)', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85em', fontFamily: 'monospace' }}>{codeMatch[1]}</code>)
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      parts.push(<strong key={key++} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic
    const italicMatch = remaining.match(/^\*(.+?)\*/)
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Link
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/)
    if (linkMatch) {
      parts.push(<a key={key++} href={linkMatch[2]} style={{ color: 'var(--brand)', textDecoration: 'underline' }}>{linkMatch[1]}</a>)
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Regular text — consume until next special character
    const nextSpecial = remaining.search(/[`*\[]/)
    if (nextSpecial === -1) {
      parts.push(remaining)
      break
    } else if (nextSpecial === 0) {
      // Special char that didn't match a pattern — consume it as text
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      parts.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

// Simple markdown to React elements renderer
function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split('\n')
  const elements: ReactNode[] = []
  let i = 0
  let codeBlock = ''
  let codeLanguage = ''
  let inCodeBlock = false

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CopyBlock key={`code-${i}`} code={codeBlock.trimEnd()} language={codeLanguage as any || 'text'} style={{ marginBottom: '1rem' }} />
        )
        codeBlock = ''
        codeLanguage = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeBlock += (codeBlock ? '\n' : '') + line
      i++
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(<h1 key={`h1-${i}`} style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '1rem', marginTop: '2rem' }}>{parseInline(line.slice(2))}</h1>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={`h2-${i}`} style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>{parseInline(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={`h3-${i}`} style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1.25rem' }}>{parseInline(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={`h4-${i}`} style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.5rem', marginTop: '1rem' }}>{parseInline(line.slice(5))}</h4>)
      i++; continue
    }

    // Unordered list items
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ marginBottom: '1rem', paddingInlineStart: '1.5rem' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{parseInline(item)}</li>)}
        </ul>
      )
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ marginBottom: '1rem', paddingInlineStart: '1.5rem' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{parseInline(item)}</li>)}
        </ol>
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++; continue
    }

    // Paragraph
    elements.push(<p key={`p-${i}`} style={{ marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{parseInline(line)}</p>)
    i++
  }

  return elements
}

export function MarkdownPage({ content }: { content: string }) {
  return (
    <div style={{ maxWidth: 800 }}>
      {renderMarkdown(content)}
    </div>
  )
}
