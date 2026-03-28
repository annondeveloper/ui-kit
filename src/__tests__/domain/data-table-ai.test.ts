import { describe, it, expect, beforeEach } from 'vitest'
import {
  analyzeColumns,
  generateInsights,
  analyzeData,
  type ColumnAnalysis,
} from '../../domain/data-table-ai'
import type { ColumnDef } from '../../domain/data-table'

// ─── Test Data ────────────────────────────────────────────────────────

interface Row {
  id: number
  name: string
  score: number
  date: string
  active: boolean
  status: string
  notes: string | null
}

const sampleData: Row[] = [
  { id: 1, name: 'Alice', score: 85, date: '2025-01-01', active: true, status: 'ok', notes: 'good' },
  { id: 2, name: 'Bob', score: 90, date: '2025-01-02', active: false, status: 'warning', notes: null },
  { id: 3, name: 'Charlie', score: 78, date: '2025-01-03', active: true, status: 'critical', notes: null },
  { id: 4, name: 'Diana', score: 92, date: '2025-01-04', active: true, status: 'ok', notes: 'fine' },
  { id: 5, name: 'Eve', score: 88, date: '2025-01-05', active: false, status: 'ok', notes: null },
]

const columns: ColumnDef<Row>[] = [
  { id: 'id', header: 'ID', accessor: 'id' },
  { id: 'name', header: 'Name', accessor: 'name' },
  { id: 'score', header: 'Score', accessor: 'score' },
  { id: 'date', header: 'Date', accessor: 'date' },
  { id: 'active', header: 'Active', accessor: 'active' },
  { id: 'status', header: 'Status', accessor: 'status' },
  { id: 'notes', header: 'Notes', accessor: 'notes' },
]

// ─── analyzeColumns ───────────────────────────────────────────────────

describe('analyzeColumns', () => {
  it('detects numeric columns', () => {
    const analysis = analyzeColumns(sampleData, columns)
    const idCol = analysis.find((a) => a.id === 'id')
    const scoreCol = analysis.find((a) => a.id === 'score')

    expect(idCol?.dataType).toBe('number')
    expect(scoreCol?.dataType).toBe('number')
    expect(scoreCol?.mean).toBeCloseTo(86.6, 0)
    expect(scoreCol?.min).toBe(78)
    expect(scoreCol?.max).toBe(92)
    expect(typeof scoreCol?.stdDev).toBe('number')
  })

  it('detects string columns', () => {
    const analysis = analyzeColumns(sampleData, columns)
    const nameCol = analysis.find((a) => a.id === 'name')
    expect(nameCol?.dataType).toBe('string')
    expect(nameCol?.uniqueCount).toBe(5)
  })

  it('detects date columns', () => {
    const analysis = analyzeColumns(sampleData, columns)
    const dateCol = analysis.find((a) => a.id === 'date')
    expect(dateCol?.dataType).toBe('date')
  })

  it('detects boolean columns', () => {
    const analysis = analyzeColumns(sampleData, columns)
    const activeCol = analysis.find((a) => a.id === 'active')
    expect(activeCol?.dataType).toBe('boolean')
  })

  it('counts null values', () => {
    const analysis = analyzeColumns(sampleData, columns)
    const notesCol = analysis.find((a) => a.id === 'notes')
    expect(notesCol?.nullCount).toBe(3)
  })

  it('detects monotonic numeric columns', () => {
    const analysis = analyzeColumns(sampleData, columns)
    const idCol = analysis.find((a) => a.id === 'id')
    expect(idCol?.isMonotonic).toBe(true)

    // score is not monotonic
    const scoreCol = analysis.find((a) => a.id === 'score')
    expect(scoreCol?.isMonotonic).toBe(false)
  })

  it('returns empty array for empty data', () => {
    const analysis = analyzeColumns([], columns)
    expect(analysis).toEqual([])
  })
})

// ─── generateInsights ─────────────────────────────────────────────────

describe('generateInsights', () => {
  let analysis: ColumnAnalysis[]

  beforeEach(() => {
    analysis = analyzeColumns(sampleData, columns)
  })

  it('suggests aggregation for numeric columns', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    const aggInsights = insights.filter(
      (i) => i.type === 'aggregation' && i.title.includes('Aggregate')
    )
    // Should have suggestions for numeric columns (id, score)
    expect(aggInsights.length).toBeGreaterThanOrEqual(1)
    expect(aggInsights[0].confidence).toBe(0.9)
    expect(aggInsights[0].apply).toBeDefined()
  })

  it('suggests time-series visualization for date columns', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    const dateInsights = insights.filter(
      (i) => i.type === 'visualization' && i.title.includes('Time-series')
    )
    expect(dateInsights.length).toBe(1)
    expect(dateInsights[0].confidence).toBe(0.8)
  })

  it('suggests group-by for low cardinality strings', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    const groupInsights = insights.filter(
      (i) => i.type === 'aggregation' && i.title.includes('Group by')
    )
    // status has 3 unique values, should be suggested
    const statusGroup = groupInsights.find((i) => i.title.includes('status'))
    expect(statusGroup).toBeDefined()
    expect(statusGroup?.confidence).toBe(0.85)
    expect(statusGroup?.apply?.groupBy).toBe('status')
  })

  it('flags outliers when present', () => {
    // Create data with outliers
    const dataWithOutlier = [
      ...sampleData,
      { id: 6, name: 'Frank', score: 200, date: '2025-01-06', active: true, status: 'ok', notes: 'wow' },
    ]
    const outlierAnalysis = analyzeColumns(dataWithOutlier, columns)
    const insights = generateInsights(dataWithOutlier, columns, outlierAnalysis)

    const anomalyInsights = insights.filter((i) => i.type === 'anomaly')
    expect(anomalyInsights.length).toBeGreaterThanOrEqual(1)
    expect(anomalyInsights[0].confidence).toBe(0.75)
  })

  it('suggests trend sparkline for monotonic numeric columns', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    const trendInsights = insights.filter((i) => i.type === 'trend')
    // id column is monotonic
    const idTrend = trendInsights.find((i) => i.title.includes('id'))
    expect(idTrend).toBeDefined()
    expect(idTrend?.confidence).toBe(0.8)
  })

  it('suggests "show empty" filter for columns with many nulls', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    // notes column has 3/5 = 60% null
    const nullInsights = insights.filter(
      (i) => i.type === 'filter' && i.title.includes('empty') && i.title.includes('notes')
    )
    expect(nullInsights.length).toBe(1)
    expect(nullInsights[0].confidence).toBe(0.6)
  })

  it('suggests pagination for large datasets', () => {
    const largeData = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      name: `Person ${i}`,
      score: Math.random() * 100,
      date: '2025-01-01',
      active: true,
      status: 'ok',
      notes: 'ok',
    }))
    const largeAnalysis = analyzeColumns(largeData, columns)
    const insights = generateInsights(largeData, columns, largeAnalysis)

    const paginationInsight = insights.find(
      (i) => i.type === 'filter' && i.title.includes('pagination')
    )
    expect(paginationInsight).toBeDefined()
    expect(paginationInsight?.confidence).toBe(0.9)
    expect(paginationInsight?.apply?.paginated).toBe(true)
  })

  it('suggests correlation for multiple numeric columns', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    const correlationInsight = insights.find(
      (i) => i.type === 'visualization' && i.title.includes('correlation')
    )
    expect(correlationInsight).toBeDefined()
    expect(correlationInsight?.confidence).toBe(0.5)
  })

  it('suggests StatusBadge for status-like columns', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    const statusInsight = insights.find(
      (i) => i.type === 'visualization' && i.title.includes('Status badges')
    )
    expect(statusInsight).toBeDefined()
    expect(statusInsight?.confidence).toBe(0.9)
  })

  it('returns insights sorted by confidence descending', () => {
    const insights = generateInsights(sampleData, columns, analysis)
    for (let i = 1; i < insights.length; i++) {
      expect(insights[i].confidence).toBeLessThanOrEqual(insights[i - 1].confidence)
    }
  })
})

// ─── analyzeData (convenience) ────────────────────────────────────────

describe('analyzeData', () => {
  it('returns insights from data and columns', () => {
    const insights = analyzeData(sampleData, columns)
    expect(insights.length).toBeGreaterThan(0)
    expect(insights[0]).toHaveProperty('id')
    expect(insights[0]).toHaveProperty('type')
    expect(insights[0]).toHaveProperty('confidence')
  })

  it('returns empty array for empty data', () => {
    const insights = analyzeData([], columns)
    expect(insights).toEqual([])
  })
})
