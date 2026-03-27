import type { ChoreographyConfig } from './choreography'

export type ChoreographyPreset =
  | 'cascade'
  | 'stagger-grid'
  | 'wave'
  | 'spiral'
  | 'focus-in'

export interface ChoreographyPresetOptions {
  duration?: number
  staggerEach?: number
}

export function getChoreographyPreset(
  name: ChoreographyPreset,
  targets: string,
  options: ChoreographyPresetOptions = {},
): ChoreographyConfig {
  const { duration = 400, staggerEach = 60 } = options

  switch (name) {
    case 'cascade':
      return {
        sequence: [
          {
            target: targets,
            animation: 'slideUp',
            duration,
            stagger: { each: staggerEach, from: 'start' },
          },
        ],
      }

    case 'stagger-grid':
      return {
        sequence: [
          {
            target: targets,
            animation: 'scaleIn',
            duration,
            stagger: { each: staggerEach, from: 'center' },
          },
        ],
      }

    case 'wave':
      return {
        sequence: [
          {
            target: targets,
            animation: 'slideUp',
            duration,
            stagger: { each: staggerEach, from: 'center' },
          },
        ],
      }

    case 'spiral':
      return {
        sequence: [
          {
            target: targets,
            animation: 'scaleIn',
            duration,
            stagger: { each: staggerEach, from: 'center' },
          },
        ],
      }

    case 'focus-in':
      return {
        sequence: [
          {
            target: targets,
            animation: 'scaleIn',
            duration,
          },
          {
            target: targets,
            animation: 'fadeIn',
            duration: duration * 0.6,
            delay: 80,
            stagger: { each: staggerEach, from: 'start' },
          },
        ],
      }

    default:
      return { sequence: [] }
  }
}
