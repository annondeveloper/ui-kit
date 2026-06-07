import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Popover } from '../../lite'

describe('Lite Popover interaction', () => {
  it('is closed by default and opens when the trigger is clicked', () => {
    render(
      <Popover content={<div>Panel body</div>}>
        <button>Open</button>
      </Popover>
    )
    expect(screen.queryByText('Panel body')).toBeNull()
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Panel body')).toBeInTheDocument()
  })

  it('toggles closed on a second trigger click', () => {
    render(
      <Popover content={<div>Panel body</div>}>
        <button>Open</button>
      </Popover>
    )
    const trigger = screen.getByText('Open')
    fireEvent.click(trigger)
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.queryByText('Panel body')).toBeNull()
  })

  it('closes on Escape', () => {
    render(
      <Popover content={<div>Panel body</div>}>
        <button>Open</button>
      </Popover>
    )
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Panel body')).toBeNull()
  })

  it('closes on outside click', () => {
    render(
      <div>
        <Popover content={<div>Panel body</div>}>
          <button>Open</button>
        </Popover>
        <span data-testid="outside">elsewhere</span>
      </div>
    )
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByText('Panel body')).toBeNull()
  })

  it('respects controlled `open` (trigger does not toggle internal state)', () => {
    render(
      <Popover open content={<div>Controlled body</div>}>
        <button>Trigger</button>
      </Popover>
    )
    expect(screen.getByText('Controlled body')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Trigger'))
    // Still open — controlled by the prop, not internal state.
    expect(screen.getByText('Controlled body')).toBeInTheDocument()
  })
})
