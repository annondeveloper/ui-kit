import { describe, it, expect, vi, afterEach } from 'vitest'
import { fmtBytes, fmtDuration, fmtCompact, fmtPct, fmtRelative, fmtUptime, fmtBps } from '../../../core/utils/format'

describe('fmtBytes', () => {
  it('formats zero bytes', () => {
    expect(fmtBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(fmtBytes(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(fmtBytes(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(fmtBytes(1048576)).toBe('1 MB')
  })

  it('formats gigabytes with decimals', () => {
    expect(fmtBytes(1073741824)).toBe('1 GB')
  })

  it('respects decimals parameter', () => {
    expect(fmtBytes(1536, 2)).toBe('1.5 KB')
  })
})

describe('fmtDuration', () => {
  it('formats seconds only', () => {
    expect(fmtDuration(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(fmtDuration(125)).toBe('2m 5s')
  })

  it('formats exact minutes', () => {
    expect(fmtDuration(120)).toBe('2m')
  })

  it('formats hours and minutes', () => {
    expect(fmtDuration(3725)).toBe('1h 2m')
  })

  it('formats exact hours', () => {
    expect(fmtDuration(3600)).toBe('1h')
  })
})

describe('fmtCompact', () => {
  it('formats thousands', () => {
    expect(fmtCompact(1234)).toBe('1.23K')
  })

  it('formats millions', () => {
    expect(fmtCompact(1234567)).toBe('1.23M')
  })

  it('formats small numbers as-is', () => {
    expect(fmtCompact(42)).toBe('42')
  })
})

describe('fmtPct', () => {
  it('formats as percentage', () => {
    expect(fmtPct(0.756)).toBe('75.6%')
  })

  it('respects decimals parameter', () => {
    expect(fmtPct(0.756, 0)).toBe('76%')
  })

  it('formats zero', () => {
    expect(fmtPct(0)).toBe('0.0%')
  })
})

describe('fmtRelative', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('formats seconds ago', () => {
    const now = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(fmtRelative(now - 30000)).toBe('30 seconds ago')
  })

  it('formats minutes ago', () => {
    const now = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(fmtRelative(now - 300000)).toBe('5 minutes ago')
  })

  it('formats hours ago', () => {
    const now = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(fmtRelative(now - 7200000)).toBe('2 hours ago')
  })

  it('formats days ago', () => {
    const now = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(fmtRelative(now - 172800000)).toBe('2 days ago')
  })
})

describe('fmtUptime', () => {
  it('formats high uptime with 3 decimals', () => {
    expect(fmtUptime(0.99995)).toBe('99.995%')
  })

  it('formats lower uptime with 2 decimals', () => {
    expect(fmtUptime(0.995)).toBe('99.50%')
  })
})

describe('fmtBps', () => {
  it('formats bytes per second', () => {
    expect(fmtBps(1024)).toBe('1 KB/s')
  })

  it('formats megabytes per second', () => {
    expect(fmtBps(1048576)).toBe('1 MB/s')
  })
})
