function parsePath(d: string): number[][] {
  const nums = d.match(/-?\d+\.?\d*/g) ?? []
  const pairs: number[][] = []
  for (let i = 0; i < nums.length; i += 2) {
    pairs.push([parseFloat(nums[i]), parseFloat(nums[i + 1] ?? nums[i])])
  }
  return pairs
}

function normalizePoints(points: number[][], targetLen: number): number[][] {
  if (points.length >= targetLen) return points.slice(0, targetLen)
  const result = [...points]
  const last = points[points.length - 1] ?? [0, 0]
  while (result.length < targetLen) result.push([...last])
  return result
}

/** Interpolate between two SVG path data strings. */
export function interpolatePath(from: string, to: string, progress: number): string {
  const fromPoints = parsePath(from)
  const toPoints = parsePath(to)

  const maxLen = Math.max(fromPoints.length, toPoints.length)
  const normalizedFrom = normalizePoints(fromPoints, maxLen)
  const normalizedTo = normalizePoints(toPoints, maxLen)

  return normalizedFrom
    .map((fp, i) => {
      const tp = normalizedTo[i]
      return fp.map((v, j) => v + (tp[j] - v) * progress)
    })
    .map((p) => p.join(' '))
    .join(' ')
}
