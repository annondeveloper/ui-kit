import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWebComponent } from '../../web-components/wrapper'

// Mock react-dom/client
const mockRender = vi.fn()
const mockUnmount = vi.fn()
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: mockRender,
    unmount: mockUnmount,
  })),
}))

// Mock react — track createElement calls
const mockCreateElement = vi.fn(
  (component: unknown, props: unknown) => ({ component, props })
)
vi.mock('react', () => ({
  createElement: (...args: unknown[]) => mockCreateElement(args[0], args[1]),
}))

// Unique tag name generator to avoid re-registration conflicts
let tagCounter = 0
function uniqueTag(prefix: string): string {
  return `${prefix}-${Date.now()}-${tagCounter++}`
}

describe('createWebComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a function (class constructor)', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant', 'size'])
    expect(typeof WC).toBe('function')
  })

  it('has correct observedAttributes static property', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant', 'size', 'full-width'])
    expect((WC as any).observedAttributes).toEqual(['variant', 'size', 'full-width'])
  })

  it('can be registered with customElements.define', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-reg')

    expect(() => customElements.define(tag, WC)).not.toThrow()
    expect(customElements.get(tag)).toBe(WC)
  })

  it('creates shadow DOM when element is created via document.createElement', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-shadow')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    expect(el.shadowRoot).toBeTruthy()
    expect(el.shadowRoot!.mode).toBe('open')
  })

  it('injects CSS into shadow DOM when cssText is provided', () => {
    const DummyComponent = () => null
    const cssText = '.ui-button { color: red; }'
    const WC = createWebComponent(DummyComponent, ['variant'], cssText)
    const tag = uniqueTag('test-css')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1)
  })

  it('does not inject CSS when no cssText is provided', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-nocss')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    // jsdom may not initialize adoptedStyleSheets, so treat undefined as empty
    const sheets = el.shadowRoot!.adoptedStyleSheets ?? []
    expect(sheets.length).toBe(0)
  })

  it('calls createRoot and render on connectedCallback (DOM append)', async () => {
    const { createRoot } = await import('react-dom/client')

    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-connect')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    document.body.appendChild(el)

    expect(createRoot).toHaveBeenCalled()
    expect(mockRender).toHaveBeenCalled()

    document.body.removeChild(el)
  })

  it('calls unmount on disconnectedCallback (DOM remove)', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-disconnect')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    document.body.appendChild(el)
    document.body.removeChild(el)

    expect(mockUnmount).toHaveBeenCalled()
  })

  it('converts attribute values to correct types', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['value', 'disabled', 'enabled', 'name'])
    const tag = uniqueTag('test-types')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    el.setAttribute('value', '42')
    el.setAttribute('disabled', 'true')
    el.setAttribute('enabled', 'false')
    el.setAttribute('name', 'hello')
    document.body.appendChild(el)

    expect(mockCreateElement).toHaveBeenCalled()
    const lastCall = mockCreateElement.mock.calls.at(-1)
    const props = lastCall?.[1] as Record<string, unknown>
    expect(props.value).toBe(42)
    expect(props.disabled).toBe(true)
    expect(props.enabled).toBe(false)
    expect(props.name).toBe('hello')

    document.body.removeChild(el)
  })

  it('passes text content as children prop', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-children')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    el.textContent = 'Click me'
    document.body.appendChild(el)

    const lastCall = mockCreateElement.mock.calls.at(-1)
    const props = lastCall?.[1] as Record<string, unknown>
    expect(props.children).toBe('Click me')

    document.body.removeChild(el)
  })

  it('re-renders on attributeChangedCallback', () => {
    const DummyComponent = () => null
    const WC = createWebComponent(DummyComponent, ['variant'])
    const tag = uniqueTag('test-attrchange')
    customElements.define(tag, WC)

    const el = document.createElement(tag)
    el.setAttribute('variant', 'primary')
    document.body.appendChild(el)

    const callsBefore = mockRender.mock.calls.length
    el.setAttribute('variant', 'secondary')
    expect(mockRender.mock.calls.length).toBeGreaterThan(callsBefore)

    document.body.removeChild(el)
  })
})
