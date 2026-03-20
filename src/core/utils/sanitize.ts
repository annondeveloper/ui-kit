const ALLOWED_TAGS = new Set([
  'p', 'span', 'strong', 'em', 'b', 'i', 'u', 'code', 'pre', 'br',
  'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
])

// Tags that should be completely removed including all children
const STRIPPED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select'])

const ALLOWED_ATTRS = new Set(['href', 'class', 'id'])

export function sanitize(html: string): string {
  if (typeof DOMParser === 'undefined') return html // SSR passthrough

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return walkAndSanitize(doc.body)
}

function walkAndSanitize(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent ?? '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  if (STRIPPED_TAGS.has(tag)) {
    // Completely remove dangerous tags and all their content
    return ''
  }

  if (!ALLOWED_TAGS.has(tag)) {
    // Strip tag but keep children
    return Array.from(el.childNodes).map(walkAndSanitize).join('')
  }

  const attrs = Array.from(el.attributes)
    .filter(attr => ALLOWED_ATTRS.has(attr.name))
    .filter(attr => {
      if (attr.name === 'href') {
        return /^https?:\/\//i.test(attr.value)
      }
      return true
    })
    .map(attr => ` ${attr.name}="${escapeAttr(attr.value)}"`)
    .join('')

  const children = Array.from(el.childNodes).map(walkAndSanitize).join('')

  if (['br'].includes(tag)) return `<${tag}${attrs} />`
  return `<${tag}${attrs}>${children}</${tag}>`
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
