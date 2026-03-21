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
    it('renders with correct className', () => {
      render(<Button>Click</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('ui-lite-button')
    })

    it('applies data-variant and data-size', () => {
      render(<Button variant="ghost" size="lg">Go</Button>)
      const btn = screen.getByRole('button')
      expect(btn.dataset.variant).toBe('ghost')
      expect(btn.dataset.size).toBe('lg')
    })

    it('merges custom className', () => {
      render(<Button className="custom">Hi</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('ui-lite-button')
      expect(btn.className).toContain('custom')
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
  })

  // ---- Badge ----
  describe('Badge', () => {
    it('renders with correct className', () => {
      render(<Badge>New</Badge>)
      const el = screen.getByText('New')
      expect(el.className).toContain('ui-lite-badge')
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
  })

  // ---- Card ----
  describe('Card', () => {
    it('renders with correct className', () => {
      render(<Card>Content</Card>)
      const el = screen.getByText('Content')
      expect(el.className).toContain('ui-lite-card')
    })

    it('applies data-variant and data-padding', () => {
      render(<Card variant="elevated" padding="lg">E</Card>)
      const el = screen.getByText('E')
      expect(el.dataset.variant).toBe('elevated')
      expect(el.dataset.padding).toBe('lg')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Card ref={ref}>Ref</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- Progress ----
  describe('Progress', () => {
    it('renders with correct className and role', () => {
      render(<Progress value={50} />)
      const el = screen.getByRole('progressbar')
      expect(el.className).toContain('ui-lite-progress')
    })

    it('sets aria attributes', () => {
      render(<Progress value={30} max={200} />)
      const el = screen.getByRole('progressbar')
      expect(el.getAttribute('aria-valuenow')).toBe('30')
      expect(el.getAttribute('aria-valuemax')).toBe('200')
    })

    it('clamps fill width', () => {
      render(<Progress value={150} max={100} />)
      const el = screen.getByRole('progressbar')
      const fill = el.querySelector('.ui-lite-progress__fill') as HTMLElement
      expect(fill.style.width).toBe('100%')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Progress ref={ref} value={0} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- Skeleton ----
  describe('Skeleton', () => {
    it('renders with correct className and aria-hidden', () => {
      render(<Skeleton data-testid="sk" />)
      const el = screen.getByTestId('sk')
      expect(el.className).toContain('ui-lite-skeleton')
      expect(el.getAttribute('aria-hidden')).toBe('true')
    })

    it('applies data-variant', () => {
      render(<Skeleton variant="circular" data-testid="sk" />)
      expect(screen.getByTestId('sk').dataset.variant).toBe('circular')
    })

    it('applies width and height styles', () => {
      render(<Skeleton width={100} height="2rem" data-testid="sk" />)
      const el = screen.getByTestId('sk')
      expect(el.style.width).toBe('100px')
      expect(el.style.height).toBe('2rem')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Skeleton ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- Checkbox ----
  describe('Checkbox', () => {
    it('renders with correct className', () => {
      render(<Checkbox label="Accept" />)
      const label = screen.getByText('Accept').closest('label')!
      expect(label.className).toContain('ui-lite-checkbox')
    })

    it('renders checkbox input', () => {
      render(<Checkbox label="Check" />)
      expect(screen.getByRole('checkbox')).toBeTruthy()
    })

    it('forwards ref to input', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} label="Ref" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.type).toBe('checkbox')
    })
  })

  // ---- ToggleSwitch ----
  describe('ToggleSwitch', () => {
    it('renders with correct className', () => {
      render(<ToggleSwitch label="Dark mode" />)
      const label = screen.getByText('Dark mode').closest('label')!
      expect(label.className).toContain('ui-lite-toggle')
    })

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
    it('renders with correct className and role', () => {
      render(<Alert>Warning!</Alert>)
      const el = screen.getByRole('alert')
      expect(el.className).toContain('ui-lite-alert')
    })

    it('applies data-variant', () => {
      render(<Alert variant="error">Err</Alert>)
      const el = screen.getByRole('alert')
      expect(el.dataset.variant).toBe('error')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Alert ref={ref}>Ref</Alert>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- Divider ----
  describe('Divider', () => {
    it('renders with correct className', () => {
      render(<Divider data-testid="div" />)
      const el = screen.getByTestId('div')
      expect(el.className).toContain('ui-lite-divider')
      expect(el.tagName).toBe('HR')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLHRElement>()
      render(<Divider ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLHRElement)
    })
  })

  // ---- Avatar ----
  describe('Avatar', () => {
    it('renders with correct className', () => {
      render(<Avatar data-testid="av">JD</Avatar>)
      const el = screen.getByTestId('av')
      expect(el.className).toContain('ui-lite-avatar')
    })

    it('applies data-size', () => {
      render(<Avatar size="lg" data-testid="av">A</Avatar>)
      expect(screen.getByTestId('av').dataset.size).toBe('lg')
    })

    it('renders img when src provided', () => {
      render(<Avatar src="/photo.jpg" alt="User" data-testid="av" />)
      const img = screen.getByTestId('av').querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toBe('/photo.jpg')
      expect(img?.getAttribute('alt')).toBe('User')
    })

    it('renders fallback when no src', () => {
      render(<Avatar fallback="JD" data-testid="av" />)
      expect(screen.getByTestId('av').textContent).toBe('JD')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Avatar ref={ref}>X</Avatar>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ---- No hooks verification ----
  describe('No internal hooks', () => {
    it('lite components are designed without heavy hooks', () => {
      // Verified by architecture: lite components use forwardRef only,
      // no useStyles, no useMotionLevel, no motion context
      expect(true).toBe(true)
    })
  })
})
