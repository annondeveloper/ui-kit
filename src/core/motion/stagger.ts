export type StaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random' | number

export interface StaggerConfig {
  each: number
  from?: StaggerFrom
  grid?: [number, number]
}

export function computeStaggerDelays(count: number, config: StaggerConfig): number[] {
  const { each, from = 'start', grid } = config
  const delays: number[] = []

  if (grid) {
    const [cols] = grid
    const centerX = (cols - 1) / 2
    const rows = Math.ceil(count / cols)
    const centerY = (rows - 1) / 2
    const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2) || 1

    for (let i = 0; i < count; i++) {
      const x = i % cols
      const y = Math.floor(i / cols)
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      delays.push(Math.round((distance / maxDist) * each * (count - 1)))
    }
    return delays
  }

  for (let i = 0; i < count; i++) {
    switch (from) {
      case 'start':
        delays.push(i * each)
        break
      case 'end':
        delays.push((count - 1 - i) * each)
        break
      case 'center': {
        const center = (count - 1) / 2
        delays.push(Math.round(Math.abs(i - center) * each))
        break
      }
      case 'edges': {
        const center = (count - 1) / 2
        delays.push(Math.round((center - Math.abs(i - center)) * each))
        break
      }
      case 'random':
        delays.push(Math.round(Math.random() * each * (count - 1)))
        break
      default:
        if (typeof from === 'number') {
          delays.push(Math.round(Math.abs(i - from) * each))
        }
    }
  }

  return delays
}
