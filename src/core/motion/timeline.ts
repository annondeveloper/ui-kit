import { type AnimationResult } from './animate'

interface TimelineEntry {
  factory: () => AnimationResult
  offset: number
  label?: string
  result?: AnimationResult
}

function parseTimeOffset(str: string): number {
  const match = str.match(/([+-]?\d+)\s*(ms|s)?/)
  if (!match) return 0
  const value = parseInt(match[1])
  const unit = match[2] ?? 'ms'
  return unit === 's' ? value * 1000 : value
}

export class Timeline {
  private entries: TimelineEntry[] = []
  private labels = new Map<string, number>()
  private currentTime = 0
  private _playbackRate = 1

  label(name: string): this {
    this.labels.set(name, this.currentTime)
    return this
  }

  add(factory: () => AnimationResult, offset?: string | number): this {
    let resolvedOffset = this.currentTime

    if (typeof offset === 'string') {
      if (offset.startsWith('-') || offset.startsWith('+')) {
        const ms = parseTimeOffset(offset)
        resolvedOffset = this.currentTime + ms
      } else if (offset.includes('+=')) {
        const [label, delta] = offset.split('+=')
        resolvedOffset = (this.labels.get(label) ?? this.currentTime) + parseTimeOffset(delta)
      }
    } else if (typeof offset === 'number') {
      resolvedOffset = offset
    }

    this.entries.push({ factory, offset: Math.max(0, resolvedOffset) })

    // Advance current time (estimate: default 300ms per animation)
    this.currentTime = resolvedOffset + 300

    return this
  }

  async play(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const entry of this.entries) {
      const delay = entry.offset / this._playbackRate
      const promise = new Promise<void>((resolve) => {
        setTimeout(() => {
          entry.result = entry.factory()
          if (entry.result.animation) {
            entry.result.animation.playbackRate = this._playbackRate
          }
          entry.result.finished.then(resolve)
        }, delay)
      })
      promises.push(promise)
    }

    await Promise.all(promises)
  }

  pause(): void {
    for (const entry of this.entries) {
      entry.result?.animation?.pause()
    }
  }

  resume(): void {
    for (const entry of this.entries) {
      entry.result?.animation?.play()
    }
  }

  cancel(): void {
    for (const entry of this.entries) {
      entry.result?.cancel()
    }
  }

  get playbackRate(): number {
    return this._playbackRate
  }
  set playbackRate(rate: number) {
    this._playbackRate = rate
    for (const entry of this.entries) {
      if (entry.result?.animation) {
        entry.result.animation.playbackRate = rate
      }
    }
  }

  /** Expose entry count for testing. */
  get size(): number {
    return this.entries.length
  }
}

export function timeline(): Timeline {
  return new Timeline()
}
