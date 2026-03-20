import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { createForm } from '../../../core/forms/create-form'
import { useForm } from '../../../core/forms/use-form'
import { Form } from '../../../core/forms/form-component'
import { FieldArray, type FieldArrayRenderProps } from '../../../core/forms/field-array'
import type { ReactNode } from 'react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function createItemsForm(
  initialItems: Record<string, unknown>[] = [{ name: 'Item 1' }, { name: 'Item 2' }],
  onSubmit = vi.fn(),
) {
  return createForm({
    fields: {
      items: { initial: initialItems },
      title: { initial: 'My List' },
    },
    onSubmit,
  })
}

/**
 * Renders a Form + FieldArray combo, exposing items and actions via data-testid.
 */
function TestFieldArray({
  def,
  renderExtra,
}: {
  def: ReturnType<typeof createItemsForm>
  renderExtra?: (props: FieldArrayRenderProps) => ReactNode
}) {
  const form = useForm(def)
  return (
    <Form form={form}>
      <FieldArray name="items">
        {(fieldArray) => (
          <div data-testid="field-array">
            {fieldArray.fields.map((field, index) => (
              <div key={field.key} data-testid={`item-${index}`}>
                <span data-testid={`item-${index}-key`}>{field.key}</span>
                <span data-testid={`item-${index}-value`}>
                  {JSON.stringify((form.values.items as Record<string, unknown>[])?.[index])}
                </span>
                <button
                  data-testid={`remove-${index}`}
                  onClick={() => fieldArray.remove(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              data-testid="append"
              onClick={() => fieldArray.append({ name: 'New Item' })}
            >
              Append
            </button>
            <button
              data-testid="append-empty"
              onClick={() => fieldArray.append()}
            >
              Append Empty
            </button>
            <button
              data-testid="move-0-1"
              onClick={() => fieldArray.move(0, 1)}
            >
              Move 0→1
            </button>
            <button
              data-testid="insert-1"
              onClick={() => fieldArray.insert(1, { name: 'Inserted' })}
            >
              Insert at 1
            </button>
            <button
              data-testid="insert-0-empty"
              onClick={() => fieldArray.insert(0)}
            >
              Insert empty at 0
            </button>
            <span data-testid="field-count">{fieldArray.fields.length}</span>
            {renderExtra?.(fieldArray)}
          </div>
        )}
      </FieldArray>
    </Form>
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('FieldArray', () => {
  it('renders initial items with stable keys', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    expect(screen.getByTestId('item-0')).toBeTruthy()
    expect(screen.getByTestId('item-1')).toBeTruthy()

    // Keys should be non-empty strings
    const key0 = screen.getByTestId('item-0-key').textContent!
    const key1 = screen.getByTestId('item-1-key').textContent!
    expect(key0.length).toBeGreaterThan(0)
    expect(key1.length).toBeGreaterThan(0)
    expect(key0).not.toBe(key1)
  })

  it('fields array length matches data length', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)
    expect(screen.getByTestId('field-count').textContent).toBe('2')
  })

  it('append() adds an item to the end', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('append'))

    expect(screen.getByTestId('field-count').textContent).toBe('3')
    expect(screen.getByTestId('item-2-value').textContent).toBe(
      JSON.stringify({ name: 'New Item' }),
    )
  })

  it('append() with default values sets those values', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('append'))

    const value = JSON.parse(screen.getByTestId('item-2-value').textContent!)
    expect(value).toEqual({ name: 'New Item' })
  })

  it('append() without values appends empty object', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('append-empty'))

    expect(screen.getByTestId('field-count').textContent).toBe('3')
    expect(screen.getByTestId('item-2-value').textContent).toBe(
      JSON.stringify({}),
    )
  })

  it('remove(index) removes the item at that index', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('remove-0'))

    expect(screen.getByTestId('field-count').textContent).toBe('1')
    // The remaining item should be the original "Item 2"
    const value = JSON.parse(screen.getByTestId('item-0-value').textContent!)
    expect(value).toEqual({ name: 'Item 2' })
  })

  it('remove() preserves other items order', () => {
    const def = createItemsForm([
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
    ])
    render(<TestFieldArray def={def} />)

    // Remove middle item
    fireEvent.click(screen.getByTestId('remove-1'))

    expect(screen.getByTestId('field-count').textContent).toBe('2')
    expect(JSON.parse(screen.getByTestId('item-0-value').textContent!)).toEqual({ name: 'A' })
    expect(JSON.parse(screen.getByTestId('item-1-value').textContent!)).toEqual({ name: 'C' })
  })

  it('move(from, to) reorders items', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('move-0-1'))

    // Items should be swapped
    expect(JSON.parse(screen.getByTestId('item-0-value').textContent!)).toEqual({ name: 'Item 2' })
    expect(JSON.parse(screen.getByTestId('item-1-value').textContent!)).toEqual({ name: 'Item 1' })
  })

  it('insert(index, values) inserts at specific position', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('insert-1'))

    expect(screen.getByTestId('field-count').textContent).toBe('3')
    expect(JSON.parse(screen.getByTestId('item-0-value').textContent!)).toEqual({ name: 'Item 1' })
    expect(JSON.parse(screen.getByTestId('item-1-value').textContent!)).toEqual({ name: 'Inserted' })
    expect(JSON.parse(screen.getByTestId('item-2-value').textContent!)).toEqual({ name: 'Item 2' })
  })

  it('insert() without values inserts empty object', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('insert-0-empty'))

    expect(screen.getByTestId('field-count').textContent).toBe('3')
    expect(JSON.parse(screen.getByTestId('item-0-value').textContent!)).toEqual({})
  })

  it('keys remain stable after remove (no re-render flicker)', () => {
    const def = createItemsForm([
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
    ])
    render(<TestFieldArray def={def} />)

    // Record key of item at index 2 ("C")
    const keyC = screen.getByTestId('item-2-key').textContent!

    // Remove item at index 0
    fireEvent.click(screen.getByTestId('remove-0'))

    // "C" is now at index 1, its key should be the same
    const newKeyC = screen.getByTestId('item-1-key').textContent!
    expect(newKeyC).toBe(keyC)
  })

  it('keys remain stable after move', () => {
    const def = createItemsForm()
    render(<TestFieldArray def={def} />)

    const key0Before = screen.getByTestId('item-0-key').textContent!
    const key1Before = screen.getByTestId('item-1-key').textContent!

    fireEvent.click(screen.getByTestId('move-0-1'))

    // Keys should have swapped positions but retained values
    const key0After = screen.getByTestId('item-0-key').textContent!
    const key1After = screen.getByTestId('item-1-key').textContent!

    expect(key0After).toBe(key1Before)
    expect(key1After).toBe(key0Before)
  })

  it('works within Form context', () => {
    const def = createItemsForm()
    // If this renders without throwing, context is properly available
    const { container } = render(<TestFieldArray def={def} />)
    expect(container.querySelector('[data-testid="field-array"]')).toBeTruthy()
  })

  it('handles empty initial array', () => {
    const def = createItemsForm([])
    render(<TestFieldArray def={def} />)
    expect(screen.getByTestId('field-count').textContent).toBe('0')
  })

  it('handles append on empty array', () => {
    const def = createItemsForm([])
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('append'))

    expect(screen.getByTestId('field-count').textContent).toBe('1')
    expect(JSON.parse(screen.getByTestId('item-0-value').textContent!)).toEqual({ name: 'New Item' })
  })

  it('handles non-array initial value gracefully', () => {
    // If initial value isn't an array, treat as empty
    const def = createForm({
      fields: {
        items: { initial: undefined },
      },
      onSubmit: vi.fn(),
    })

    function TestNonArray() {
      const form = useForm(def)
      return (
        <Form form={form}>
          <FieldArray name="items">
            {(fieldArray) => (
              <div>
                <span data-testid="field-count">{fieldArray.fields.length}</span>
                <button
                  data-testid="append"
                  onClick={() => fieldArray.append({ name: 'First' })}
                >
                  Append
                </button>
              </div>
            )}
          </FieldArray>
        </Form>
      )
    }

    render(<TestNonArray />)
    expect(screen.getByTestId('field-count').textContent).toBe('0')

    fireEvent.click(screen.getByTestId('append'))
    expect(screen.getByTestId('field-count').textContent).toBe('1')
  })

  it('multiple appends produce unique keys', () => {
    const def = createItemsForm([])
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('append'))
    fireEvent.click(screen.getByTestId('append'))
    fireEvent.click(screen.getByTestId('append'))

    const key0 = screen.getByTestId('item-0-key').textContent!
    const key1 = screen.getByTestId('item-1-key').textContent!
    const key2 = screen.getByTestId('item-2-key').textContent!

    expect(new Set([key0, key1, key2]).size).toBe(3)
  })

  it('remove last item results in empty array', () => {
    const def = createItemsForm([{ name: 'Only' }])
    render(<TestFieldArray def={def} />)

    fireEvent.click(screen.getByTestId('remove-0'))
    expect(screen.getByTestId('field-count').textContent).toBe('0')
  })
})
