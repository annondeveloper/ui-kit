import type { ColumnDef } from './data-table'

// ─── Types ────────────────────────────────────────────────────────────

export type InsightType = 'aggregation' | 'visualization' | 'filter' | 'anomaly' | 'trend'

export interface DataInsight {
  id: string
  type: InsightType
  title: string
  description: string
  confidence: number // 0-1
  icon: string // icon name
  apply?: Record<string, unknown> // Props to merge into DataTable
}

export interface ColumnAnalysis {
  id: string
  dataType: 'number' | 'string' | 'date' | 'boolean' | 'unknown'
  uniqueCount: number
  nullCount: number
  isMonotonic: boolean
  // For numbers:
  mean?: number
  stdDev?: number
  min?: number
  max?: number
  outlierCount?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────

function getValue<T>(row: T, accessor: ColumnDef<T>['accessor']): unknown {
  if (typeof accessor === 'function') return accessor(row)
  return row[accessor]
}

function inferDataType(values: unknown[]): ColumnAnalysis['dataType'] {
  let numCount = 0
  let dateCount = 0
  let boolCount = 0
  let strCount = 0
  let total = 0

  for (const v of values) {
    if (v == null) continue
    total++
    if (typeof v === 'boolean') {
      boolCount++
    } else if (typeof v === 'number' && !Number.isNaN(v)) {
      numCount++
    } else if (v instanceof Date) {
      dateCount++
    } else if (typeof v === 'string') {
      // Check if it looks like a date string
      if (/^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v)) {
        const parsed = new Date(v)
        if (!Number.isNaN(parsed.getTime())) {
          dateCount++
          continue
        }
      }
      // Check if it looks like a number
      const num = Number(v)
      if (v.trim() !== '' && !Number.isNaN(num)) {
        numCount++
        continue
      }
      strCount++
    } else {
      strCount++
    }
  }

  if (total === 0) return 'unknown'

  const threshold = total * 0.7
  if (numCount >= threshold) return 'number'
  if (dateCount >= threshold) return 'date'
  if (boolCount >= threshold) return 'boolean'
  if (strCount >= threshold) return 'string'
  return 'unknown'
}

function computeNumericStats(values: number[]): {
  mean: number
  stdDev: number
  min: number
  max: number
  outlierCount: number
} {
  if (values.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0, outlierCount: 0 }

  let sum = 0
  let min = Infinity
  let max = -Infinity

  for (const v of values) {
    sum += v
    if (v < min) min = v
    if (v > max) max = v
  }

  const mean = sum / values.length

  let sumSqDiff = 0
  for (const v of values) {
    const diff = v - mean
    sumSqDiff += diff * diff
  }
  const stdDev = Math.sqrt(sumSqDiff / values.length)

  // Count outliers (>2 standard deviations from mean)
  let outlierCount = 0
  if (stdDev > 0) {
    for (const v of values) {
      if (Math.abs(v - mean) > 2 * stdDev) outlierCount++
    }
  }

  return { mean, stdDev, min, max, outlierCount }
}

function isMonotonic(values: number[]): boolean {
  if (values.length < 2) return true
  let increasing = true
  let decreasing = true

  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) increasing = false
    if (values[i] > values[i - 1]) decreasing = false
    if (!increasing && !decreasing) return false
  }

  return true
}

const STATUS_VALUES = new Set([
  'ok', 'warning', 'critical', 'error', 'success', 'fail', 'failed',
  'active', 'inactive', 'pending', 'healthy', 'unhealthy', 'degraded',
  'up', 'down', 'online', 'offline', 'enabled', 'disabled',
])

function isStatusColumn(uniqueValues: Set<string>): boolean {
  if (uniqueValues.size === 0 || uniqueValues.size > 10) return false
  let matchCount = 0
  for (const v of uniqueValues) {
    if (STATUS_VALUES.has(v.toLowerCase())) matchCount++
  }
  return matchCount / uniqueValues.size >= 0.5
}

// ─── Column Analysis ──────────────────────────────────────────────────

export function analyzeColumns<T>(data: T[], columns: ColumnDef<T>[]): ColumnAnalysis[] {
  if (data.length === 0) return []

  return columns.map((col) => {
    const rawValues = data.map((row) => getValue(row, col.accessor))
    const dataType = inferDataType(rawValues)

    const uniqueSet = new Set<string>()
    let nullCount = 0

    for (const v of rawValues) {
      if (v == null || v === '') {
        nullCount++
      } else {
        uniqueSet.add(String(v))
      }
    }

    const analysis: ColumnAnalysis = {
      id: col.id,
      dataType,
      uniqueCount: uniqueSet.size,
      nullCount,
      isMonotonic: false,
    }

    if (dataType === 'number') {
      const numValues: number[] = []
      for (const v of rawValues) {
        if (v != null) {
          const n = typeof v === 'number' ? v : Number(v)
          if (!Number.isNaN(n)) numValues.push(n)
        }
      }
      const stats = computeNumericStats(numValues)
      analysis.mean = stats.mean
      analysis.stdDev = stats.stdDev
      analysis.min = stats.min
      analysis.max = stats.max
      analysis.outlierCount = stats.outlierCount
      analysis.isMonotonic = isMonotonic(numValues)
    }

    return analysis
  })
}

// ─── Insight Generation ───────────────────────────────────────────────

let insightCounter = 0

function makeId(): string {
  return `insight-${++insightCounter}-${Date.now()}`
}

export function generateInsights<T>(
  data: T[],
  columns: ColumnDef<T>[],
  analysis: ColumnAnalysis[]
): DataInsight[] {
  const insights: DataInsight[] = []
  const numericCols: string[] = []

  for (const col of analysis) {
    const colDef = columns.find((c) => c.id === col.id)

    // Rule 1: Numeric column -> suggest sum/avg aggregation
    if (col.dataType === 'number') {
      numericCols.push(col.id)
      insights.push({
        id: makeId(),
        type: 'aggregation',
        title: `Aggregate "${col.id}"`,
        description: `Show sum and average for the "${col.id}" column (mean: ${col.mean?.toFixed(1)}, range: ${col.min}–${col.max}).`,
        confidence: 0.9,
        icon: 'calculator',
        apply: {
          aggregations: { [col.id]: 'avg' },
        },
      })
    }

    // Rule 2: Date column -> suggest time-series visualization
    if (col.dataType === 'date') {
      insights.push({
        id: makeId(),
        type: 'visualization',
        title: `Time-series on "${col.id}"`,
        description: `Visualize data distribution over time using the "${col.id}" column.`,
        confidence: 0.8,
        icon: 'chart-line',
        apply: {
          sortBy: [{ column: col.id, direction: 'asc' as const }],
        },
      })
    }

    // Rule 3: Low cardinality string -> suggest group-by
    if (col.dataType === 'string' && col.uniqueCount > 0 && col.uniqueCount < 10) {
      insights.push({
        id: makeId(),
        type: 'aggregation',
        title: `Group by "${col.id}"`,
        description: `Group rows by "${col.id}" (${col.uniqueCount} unique values).`,
        confidence: 0.85,
        icon: 'layers',
        apply: {
          groupBy: col.id,
        },
      })
    }

    // Rule 4: High cardinality string -> suggest search filter
    if (col.dataType === 'string' && col.uniqueCount > 50) {
      insights.push({
        id: makeId(),
        type: 'filter',
        title: `Add search for "${col.id}"`,
        description: `Enable search filtering for "${col.id}" (${col.uniqueCount} unique values).`,
        confidence: 0.7,
        icon: 'search',
        apply: {
          searchable: true,
        },
      })
    }

    // Rule 5: Numeric outliers -> flag anomalies
    if (col.dataType === 'number' && col.outlierCount != null && col.outlierCount > 0) {
      insights.push({
        id: makeId(),
        type: 'anomaly',
        title: `Outliers in "${col.id}"`,
        description: `Found ${col.outlierCount} outlier${col.outlierCount === 1 ? '' : 's'} (>2σ from mean) in "${col.id}".`,
        confidence: 0.75,
        icon: 'alert-triangle',
      })
    }

    // Rule 6: Monotonic numeric -> suggest trend sparkline
    if (col.dataType === 'number' && col.isMonotonic && data.length > 2) {
      insights.push({
        id: makeId(),
        type: 'trend',
        title: `Trend in "${col.id}"`,
        description: `The "${col.id}" column shows a monotonic trend — consider adding a sparkline.`,
        confidence: 0.8,
        icon: 'trending-up',
      })
    }

    // Rule 7: Many nulls -> suggest "show empty" filter
    if (col.nullCount > 0 && col.nullCount / data.length > 0.1) {
      const pct = Math.round((col.nullCount / data.length) * 100)
      insights.push({
        id: makeId(),
        type: 'filter',
        title: `${pct}% empty in "${col.id}"`,
        description: `${col.nullCount} of ${data.length} rows have empty values in "${col.id}". Add a filter to show/hide empty rows.`,
        confidence: 0.6,
        icon: 'filter',
        apply: {
          filterable: true,
        },
      })
    }

    // Rule 10: Status-like column -> suggest StatusBadge rendering
    if (col.dataType === 'string' && col.uniqueCount <= 10 && colDef) {
      const rawValues = data.map((row) => getValue(row, colDef.accessor))
      const uniqueStrings = new Set<string>()
      for (const v of rawValues) {
        if (v != null && typeof v === 'string') uniqueStrings.add(v)
      }
      if (isStatusColumn(uniqueStrings)) {
        insights.push({
          id: makeId(),
          type: 'visualization',
          title: `Status badges for "${col.id}"`,
          description: `The "${col.id}" column contains status values — render as StatusBadge components.`,
          confidence: 0.9,
          icon: 'badge-check',
        })
      }
    }
  }

  // Rule 8: Large dataset -> suggest pagination
  if (data.length > 100) {
    insights.push({
      id: makeId(),
      type: 'filter',
      title: 'Enable pagination',
      description: `Dataset has ${data.length} rows. Pagination improves performance and readability.`,
      confidence: 0.9,
      icon: 'list',
      apply: {
        paginated: true,
        pageSize: 25,
      },
    })
  }

  // Rule 9: Multiple numeric columns -> suggest correlation
  if (numericCols.length >= 2) {
    insights.push({
      id: makeId(),
      type: 'visualization',
      title: 'Explore correlations',
      description: `${numericCols.length} numeric columns detected (${numericCols.join(', ')}). Consider scatter-plot or correlation analysis.`,
      confidence: 0.5,
      icon: 'scatter-chart',
    })
  }

  // Sort by confidence descending
  insights.sort((a, b) => b.confidence - a.confidence)

  return insights
}

// ─── Convenience ──────────────────────────────────────────────────────

export function analyzeData<T>(data: T[], columns: ColumnDef<T>[]): DataInsight[] {
  const analysis = analyzeColumns(data, columns)
  return generateInsights(data, columns, analysis)
}
