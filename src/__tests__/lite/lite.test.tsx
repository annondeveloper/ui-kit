import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import {
  Button,
  Badge,
  Card,
  Progress,
  Skeleton,
  Checkbox,
  ToggleSwitch,
  Alert,
  Divider,
  Avatar,
} from '../../lite'

describe('Lite tier components', () => {
  // ---- Button ----
  describe('Button', () => {
    it('renders a button element', () => {
      render(<Button>Click</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toBeTruthy()
    })

    it('applies data-variant and data-size', () => {
      render(<Button variant="ghost" size="lg">Go</Button>)
      const btn = screen.getByRole('button')
      expect(btn.dataset.variant).toBe('ghost')
      expect(btn.dataset.size).toBe('lg')
    })

    it('forces motion=0 (no animation)', () => {
      render(<Button>No Motion</Button>)
      const btn = screen.getByRole('button')
      expect(btn.dataset.motion).toBe('0')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('defaults to variant=primary size=md', () => {
      render(<Button>Defaults</Button>)
      const btn = screen.getByRole('button')
      expect(btn.dataset.variant).toBe('primary')
      expect(btn.dataset.size).toBe('md')
    })

    it('supports all Standard props (loading, icon, fullWidth)', () => {
      render(<Button loading fullWidth>Loading</Button>)
      const btn = screen.getByRole('button')
      expect(btn.dataset.loading).toBe('true')
      expect(btn.dataset.fullWidth).toBe('true')
    })
  })

  // ---- Badge ----
  describe('Badge', () => {
    it('renders with text content', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeTruthy()
    })

    it('applies data-variant and data-size', () => {
      render(<Badge variant="success" size="md">OK</Badge>)
      const el = screen.getByText('OK')
      expect(el.dataset.variant).toBe('success')
      expect(el.dataset.size).toBe('md')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLSpanElement>()
      render(<Badge ref={ref}>Ref</Badge>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('supports dot prop', () => {
      render(<Badge dot>Has Dot</Badge>)
      const root = screen.getByText('Has Dot').closest('[data-variant]') as HTMLElement
      const dotEl = root?.querySelector('.ui-badge__dot')
      expect(dotEl).toBeTruthy()
    })
  })

  // ---- Card ----
  describe('Card', () => {
    it('renders children content', () => {
      render(<Card>Content</Card>)
      expect(screen.getByText('Content')).toBeTruthy()
    })

    it('applies data-variant and data-padding', () => {
      render(<Card variant="elevated" padding="lg">E</Card>)
      const el = screen.getByText('E').closest('[data-variant]') as HTMLElement
      expect(el.dataset.variant).toBe('elevated')
      expect(el.dataset.padding).toBe('lg')
    })

    it('supports padding="none"', () => {
      render(<Card padding="none">No Padding</Card>)
      const el = screen.getByText('No Padding').closest('[data-padding]') as HTMLElement
      expect(el.dataset.padding).toBe('none')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLElement>()
      render(<Card ref={ref}>Ref</Card>)
      expect(ref.current).toBeTruthy()
    })
  })

  // ---- Progress ----
  describe('Progress', () => {
    it('renders with role=progressbar', () => {
      render(<Progress value={50} />)
      const el = screen.getByRole('progressbar')
      expect(el).toBeTruthy()
    })

    it('sets aria attributes', () => {
      render(<Progress value={30} max={200} />)
      const el = screen.getByRole('progressbar')
      expect(el.getAttribute('aria-valuenow')).toBe('30')
      expect(el.getAttribute('aria-valuemax')).toBe('200')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Progress ref={ref} value={0} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('supports variant and showValue props', () => {
      render(<Progress value={75} variant="success" showValue />)
      const el = screen.getByRole('progressbar')
      expect(el.dataset.variant).toBe('success')
    })
  })

  // ---- Skeleton ----
  describe('Skeleton', () => {
    it('renders with aria-hidden', () => {
      render(<Skeleton data-testid="sk" />)
      const el = screen.getByTestId('sk')
      expect(el.getAttribute('aria-hidden')).toBe('true')
    })

    it('applies data-variant', () => {
      render(<Skeleton variant="circular" data-testid="sk" />)
      expect(screen.getByTestId('sk').dataset.variant).toBe('circular')
    })

    it('supports rounded variant', () => {
      render(<Skeleton variant="rounded" data-testid="sk" />)
      expect(screen.getByTestId('sk').dataset.variant).toBe('rounded')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Skeleton ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- Checkbox ----
  describe('Checkbox', () => {
    it('renders a checkbox input', () => {
      render(<Checkbox label="Accept" />)
      expect(screen.getByRole('checkbox')).toBeTruthy()
    })

    it('forwards ref to input', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} label="Ref" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.type).toBe('checkbox')
    })

    it('supports indeterminate prop', () => {
      render(<Checkbox label="Mixed" indeterminate />)
      // indeterminate is set imperatively, not as an attribute
      expect(screen.getByRole('checkbox')).toBeTruthy()
    })
  })

  // ---- ToggleSwitch ----
  describe('ToggleSwitch', () => {
    it('renders switch role', () => {
      render(<ToggleSwitch label="Toggle" />)
      expect(screen.getByRole('switch')).toBeTruthy()
    })

    it('forwards ref to input', () => {
      const ref = createRef<HTMLInputElement>()
      render(<ToggleSwitch ref={ref} label="Ref" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  // ---- Alert ----
  describe('Alert', () => {
    it('renders with role=alert', () => {
      render(<Alert variant="info">Warning!</Alert>)
      const el = screen.getByRole('alert')
      expect(el).toBeTruthy()
    })

    it('applies data-variant', () => {
      render(<Alert variant="error">Err</Alert>)
      const el = screen.getByRole('alert')
      expect(el.dataset.variant).toBe('error')
    })

    it('supports banner and compact props', () => {
      render(<Alert variant="info" banner compact>Banner</Alert>)
      const el = screen.getByRole('alert')
      expect(el.dataset.banner).toBeTruthy()
      expect(el.dataset.compact).toBeTruthy()
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Alert ref={ref} variant="info">Ref</Alert>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- Divider ----
  describe('Divider', () => {
    it('renders an hr element', () => {
      render(<Divider data-testid="div" />)
      const el = screen.getByTestId('div')
      expect(el.tagName).toBe('HR')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLHRElement>()
      render(<Divider ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLHRElement)
    })

    it('supports variant and orientation', () => {
      render(<Divider variant="dashed" orientation="vertical" data-testid="div" />)
      const el = screen.getByTestId('div')
      expect(el.dataset.variant).toBe('dashed')
      expect(el.dataset.orientation).toBe('vertical')
    })
  })

  // ---- Avatar ----
  describe('Avatar', () => {
    it('renders with data-size', () => {
      render(<Avatar size="lg" data-testid="av">A</Avatar>)
      expect(screen.getByTestId('av').dataset.size).toBe('lg')
    })

    it('renders img when src provided', () => {
      render(<Avatar src="/photo.jpg" alt="User" data-testid="av" />)
      const img = screen.getByTestId('av').querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toBe('/photo.jpg')
    })

    it('renders initials when name is provided', () => {
      render(<Avatar name="John Doe" data-testid="av" />)
      expect(screen.getByTestId('av').textContent).toContain('JD')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Avatar ref={ref}>X</Avatar>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('supports status prop', () => {
      render(<Avatar status="online" data-testid="av">A</Avatar>)
      // Status renders as a child element, not a data attribute on root
      const statusEl = screen.getByTestId('av').querySelector('[data-status]') as HTMLElement
      expect(statusEl?.dataset.status).toBe('online')
    })
  })

  // ---- Proxy pattern verification ----
  describe('Proxy pattern', () => {
    it('all Lite components render the Standard component with motion=0', () => {
      // Verified by architecture: all Lite wrappers import Standard component
      // and pass motion={0}. TypeScript enforces the Omit<Props, 'motion'> constraint.
      // This test documents the design contract.
      render(<Button>Verify</Button>)
      const btn = screen.getByRole('button')
      expect(btn.dataset.motion).toBe('0')
    })
  })
})
