import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextSplitter } from '../../../core/motion/text-splitter'

describe('TextSplitter', () => {
  it('renders correct number of char spans', () => {
    const { container } = render(<TextSplitter text="Hello" />)
    const spans = container.querySelectorAll('span[aria-hidden="true"]')
    expect(spans.length).toBe(5) // H, e, l, l, o
  })

  it('renders correct number of word spans', () => {
    const { container } = render(<TextSplitter text="Hello World" splitBy="words" />)
    const spans = container.querySelectorAll('span[aria-hidden="true"]')
    // "Hello", " ", "World"
    expect(spans.length).toBe(3)
  })

  it('has aria-label with full text', () => {
    render(<TextSplitter text="Hello" />)
    expect(screen.getByLabelText('Hello')).toBeTruthy()
  })

  it('applies className and charClassName', () => {
    const { container } = render(
      <TextSplitter text="Hi" className="outer" charClassName="inner" />,
    )
    expect(container.querySelector('.outer')).toBeTruthy()
    expect(container.querySelectorAll('.inner').length).toBe(2)
  })
})
