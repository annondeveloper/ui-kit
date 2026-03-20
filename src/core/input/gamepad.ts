import { useEffect } from 'react'

export interface GamepadConfig {
  enabled?: boolean
  deadzone?: number
  repeatDelay?: number
  repeatRate?: number
}

export function useGamepadNavigation(config: GamepadConfig = {}): void {
  const { enabled = true, deadzone = 0.15, repeatDelay = 500, repeatRate = 100 } = config

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.getGamepads) return

    let rafId: number
    let lastPress = 0
    let repeatTimer: ReturnType<typeof setTimeout> | null = null

    const simulateKey = (key: string) => {
      document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }

    const poll = () => {
      const gamepads = navigator.getGamepads()
      for (const gp of gamepads) {
        if (!gp) continue

        // D-pad or left stick
        const axes = gp.axes
        if (axes[1] < -deadzone) simulateKey('ArrowUp')
        else if (axes[1] > deadzone) simulateKey('ArrowDown')
        if (axes[0] < -deadzone) simulateKey('ArrowLeft')
        else if (axes[0] > deadzone) simulateKey('ArrowRight')

        // Buttons: A=Enter, B=Escape
        if (gp.buttons[0]?.pressed) simulateKey('Enter')
        if (gp.buttons[1]?.pressed) simulateKey('Escape')
      }
      rafId = requestAnimationFrame(poll)
    }

    rafId = requestAnimationFrame(poll)
    return () => {
      cancelAnimationFrame(rafId)
      if (repeatTimer) clearTimeout(repeatTimer)
    }
  }, [enabled, deadzone, repeatDelay, repeatRate])
}
