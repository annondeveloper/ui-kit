import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { Tabs, TabPanel, type Tab } from '../../components/tabs'

expect.extend(toHaveNoViolations)

const baseTabs: Tab[] = [
  { id: 'one', label: 'Tab One' },
  { id: 'two', label: 'Tab Two' },
  { id: 'three', label: 'Tab Three' },
]

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs tabs={baseTabs} defaultTab="one" {...props}>
      <TabPanel tabId="one">Panel One</TabPanel>
      <TabPanel tabId="two">Panel Two</TabPanel>
      <TabPanel tabId="three">Panel Three</TabPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = renderTabs()
      expect(container.querySelector('.ui-tabs')).toBeInTheDocument()
    })

    it('renders a tablist role', () => {
      renderTabs()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('renders tab buttons with role="tab"', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(3)
    })

    it('renders tab labels', () => {
      renderTabs()
      expect(screen.getByText('Tab One')).toBeInTheDocument()
      expect(screen.getByText('Tab Two')).toBeInTheDocument()
      expect(screen.getByText('Tab Three')).toBeInTheDocument()
    })

    it('renders tabpanel with role="tabpanel"', () => {
      renderTabs()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('renders active panel content', () => {
      renderTabs()
      expect(screen.getByText('Panel One')).toBeInTheDocument()
    })

    it('renders icons when provided', () => {
      const tabsWithIcons: Tab[] = [
        { id: 'a', label: 'A', icon: <span data-testid="icon-a">★</span> },
        { id: 'b', label: 'B' },
      ]
      render(
        <Tabs tabs={tabsWithIcons} defaultTab="a">
          <TabPanel tabId="a">Panel A</TabPanel>
          <TabPanel tabId="b">Panel B</TabPanel>
        </Tabs>
      )
      expect(screen.getByTestId('icon-a')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = renderTabs({ className: 'custom-tabs' })
      expect(container.querySelector('.custom-tabs')).toBeInTheDocument()
    })
  })

  // ─── Variants ──────────────────────────────────────────────────────

  describe('variants', () => {
    it('renders underline variant by default', () => {
      const { container } = renderTabs()
      expect(container.querySelector('[data-variant="underline"]')).toBeInTheDocument()
    })

    it('renders pills variant', () => {
      const { container } = renderTabs({ variant: 'pills' })
      expect(container.querySelector('[data-variant="pills"]')).toBeInTheDocument()
    })

    it('renders enclosed variant', () => {
      const { container } = renderTabs({ variant: 'enclosed' })
      expect(container.querySelector('[data-variant="enclosed"]')).toBeInTheDocument()
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = renderTabs({ size: 'sm' })
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size by default', () => {
      const { container } = renderTabs()
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = renderTabs({ size: 'lg' })
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Active Tab ────────────────────────────────────────────────────

  describe('active tab', () => {
    it('marks first tab as active with defaultTab', () => {
      renderTabs({ defaultTab: 'one' })
      const tab = screen.getByRole('tab', { name: 'Tab One' })
      expect(tab).toHaveAttribute('aria-selected', 'true')
    })

    it('marks correct tab as active with defaultTab', () => {
      renderTabs({ defaultTab: 'two' })
      const tab = screen.getByRole('tab', { name: 'Tab Two' })
      expect(tab).toHaveAttribute('aria-selected', 'true')
    })

    it('shows corresponding panel for defaultTab', () => {
      renderTabs({ defaultTab: 'two' })
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
    })

    it('defaults to first tab when no defaultTab provided', () => {
      render(
        <Tabs tabs={baseTabs}>
          <TabPanel tabId="one">Panel One</TabPanel>
          <TabPanel tabId="two">Panel Two</TabPanel>
          <TabPanel tabId="three">Panel Three</TabPanel>
        </Tabs>
      )
      expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  // ─── Controlled Mode ──────────────────────────────────────────────

  describe('controlled mode', () => {
    it('uses activeTab prop when provided', () => {
      renderTabs({ activeTab: 'two' })
      expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
    })

    it('calls onChange when tab clicked', async () => {
      const onChange = vi.fn()
      renderTabs({ activeTab: 'one', onChange })
      const tabTwo = screen.getByRole('tab', { name: 'Tab Two' })
      await userEvent.click(tabTwo)
      expect(onChange).toHaveBeenCalledWith('two')
    })

    it('stays on controlled tab even after click', async () => {
      const onChange = vi.fn()
      renderTabs({ activeTab: 'one', onChange })
      await userEvent.click(screen.getByRole('tab', { name: 'Tab Two' }))
      // Still on tab one because controlled
      expect(screen.getByText('Panel One')).toBeInTheDocument()
    })
  })

  // ─── Uncontrolled Mode ────────────────────────────────────────────

  describe('uncontrolled mode', () => {
    it('switches tab on click', async () => {
      renderTabs()
      await userEvent.click(screen.getByRole('tab', { name: 'Tab Two' }))
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true')
    })

    it('calls onChange callback on click', async () => {
      const onChange = vi.fn()
      renderTabs({ onChange })
      await userEvent.click(screen.getByRole('tab', { name: 'Tab Three' }))
      expect(onChange).toHaveBeenCalledWith('three')
    })
  })

  // ─── Keyboard Navigation ──────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('moves focus with ArrowRight', async () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[1])
    })

    it('moves focus with ArrowLeft', async () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[1].focus()
      fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('wraps focus from last to first with ArrowRight', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[2].focus()
      fireEvent.keyDown(tabs[2], { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('wraps focus from first to last with ArrowLeft', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[2])
    })

    it('moves to first tab with Home key', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[2].focus()
      fireEvent.keyDown(tabs[2], { key: 'Home' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('moves to last tab with End key', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'End' })
      expect(document.activeElement).toBe(tabs[2])
    })

    it('activates tab on Enter', async () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
      fireEvent.keyDown(tabs[1], { key: 'Enter' })
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
    })

    it('activates tab on Space', async () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
      fireEvent.keyDown(tabs[1], { key: ' ' })
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
    })
  })

  // ─── Disabled Tabs ────────────────────────────────────────────────

  describe('disabled tabs', () => {
    const tabsWithDisabled: Tab[] = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B', disabled: true },
      { id: 'c', label: 'C' },
    ]

    it('renders disabled tab with aria-disabled', () => {
      render(
        <Tabs tabs={tabsWithDisabled} defaultTab="a">
          <TabPanel tabId="a">Panel A</TabPanel>
          <TabPanel tabId="b">Panel B</TabPanel>
          <TabPanel tabId="c">Panel C</TabPanel>
        </Tabs>
      )
      expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-disabled', 'true')
    })

    it('skips disabled tabs during keyboard navigation', () => {
      render(
        <Tabs tabs={tabsWithDisabled} defaultTab="a">
          <TabPanel tabId="a">Panel A</TabPanel>
          <TabPanel tabId="b">Panel B</TabPanel>
          <TabPanel tabId="c">Panel C</TabPanel>
        </Tabs>
      )
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
      // Should skip disabled B tab and go to C
      expect(document.activeElement).toBe(tabs[2])
    })

    it('does not activate disabled tab on click', async () => {
      render(
        <Tabs tabs={tabsWithDisabled} defaultTab="a">
          <TabPanel tabId="a">Panel A</TabPanel>
          <TabPanel tabId="b">Panel B</TabPanel>
          <TabPanel tabId="c">Panel C</TabPanel>
        </Tabs>
      )
      await userEvent.click(screen.getByRole('tab', { name: 'B' }))
      expect(screen.getByText('Panel A')).toBeInTheDocument()
    })
  })

  // ─── Lazy Rendering ───────────────────────────────────────────────

  describe('lazy rendering', () => {
    it('only renders active panel when lazy=true', () => {
      renderTabs({ lazy: true })
      expect(screen.getByText('Panel One')).toBeInTheDocument()
      expect(screen.queryByText('Panel Two')).not.toBeInTheDocument()
      expect(screen.queryByText('Panel Three')).not.toBeInTheDocument()
    })

    it('renders all panels when lazy=false', () => {
      renderTabs({ lazy: false })
      // All panels exist in DOM, but non-active ones are hidden
      expect(screen.getByText('Panel One')).toBeInTheDocument()
      // Non-active panels are in DOM but hidden
      const panels = document.querySelectorAll('[role="tabpanel"]')
      expect(panels.length).toBe(3)
    })

    it('switches panel content when lazy tab changes', async () => {
      renderTabs({ lazy: true })
      await userEvent.click(screen.getByRole('tab', { name: 'Tab Two' }))
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
      expect(screen.queryByText('Panel One')).not.toBeInTheDocument()
    })
  })

  // ─── Vertical Orientation ─────────────────────────────────────────

  describe('vertical orientation', () => {
    it('sets aria-orientation to vertical', () => {
      renderTabs({ orientation: 'vertical' })
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('uses ArrowDown/ArrowUp for vertical navigation', () => {
      renderTabs({ orientation: 'vertical' })
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(tabs[0], { key: 'ArrowDown' })
      expect(document.activeElement).toBe(tabs[1])
    })

    it('uses ArrowUp for backward navigation in vertical', () => {
      renderTabs({ orientation: 'vertical' })
      const tabs = screen.getAllByRole('tab')
      tabs[1].focus()
      fireEvent.keyDown(tabs[1], { key: 'ArrowUp' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('sets data-orientation attribute', () => {
      const { container } = renderTabs({ orientation: 'vertical' })
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
    })
  })

  // ─── ARIA Attributes ──────────────────────────────────────────────

  describe('aria attributes', () => {
    it('links tab to panel with aria-controls', () => {
      renderTabs()
      const tab = screen.getByRole('tab', { name: 'Tab One' })
      const panelId = tab.getAttribute('aria-controls')
      expect(panelId).toBeTruthy()
      expect(document.getElementById(panelId!)).toBeInTheDocument()
    })

    it('links panel to tab with aria-labelledby', () => {
      renderTabs()
      const panel = screen.getByRole('tabpanel')
      const labelledBy = panel.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      expect(document.getElementById(labelledBy!)).toBeInTheDocument()
    })

    it('sets aria-selected on active tab', () => {
      renderTabs()
      expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'false')
    })

    it('sets aria-orientation on tablist', () => {
      renderTabs()
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('sets tabindex appropriately for roving tabindex', () => {
      renderTabs()
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).toHaveAttribute('tabindex', '0')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = renderTabs({ motion: 0 })
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })

    it('defaults to motion level from context', () => {
      const { container } = renderTabs()
      // Should have some data-motion set
      expect(container.querySelector('[data-motion]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = renderTabs()
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with vertical orientation', async () => {
      const { container } = renderTabs({ orientation: 'vertical' })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
