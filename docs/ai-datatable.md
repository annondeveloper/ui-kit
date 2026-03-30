# AI DataTable Suggestions

The DataTable component includes a built-in heuristic engine that analyzes your data and surfaces actionable suggestions — no external APIs, no dependencies, pure statistics.

## Quick Start

```tsx
import { DataTable } from '@annondeveloper/ui-kit'

<DataTable data={rows} columns={cols} showSuggestions />
```

When `showSuggestions` is `true`, the table calls `analyzeData()` from `src/domain/data-table-ai.ts` during render (memoized on `data` and `columns`). Suggestions appear in a `<DataTableSuggestions>` bar above the table rows.

## How It Works

The engine runs in two phases:

1. **`analyzeColumns(data, columns)`** — Infers each column's data type (`number`, `string`, `date`, `boolean`) using a 70% threshold heuristic. For numeric columns, it computes mean, standard deviation, min/max, outlier count (>2 sigma), and monotonicity.

2. **`generateInsights(data, columns, analysis)`** — Applies 10 rules against the column analysis to produce `DataInsight[]` objects, each with a `confidence` score (0-1). Results are sorted by confidence descending.

## The 10 Suggestion Rules

| # | Trigger | Type | Insight |
|---|---------|------|---------|
| 1 | Numeric column | `aggregation` | Suggest sum/avg aggregation with mean and range stats |
| 2 | Date column | `visualization` | Suggest time-series visualization, apply ascending sort |
| 3 | Low-cardinality string (<10 unique) | `aggregation` | Suggest group-by on the column |
| 4 | High-cardinality string (>50 unique) | `filter` | Suggest enabling search filtering |
| 5 | Numeric outliers (>2 std dev) | `anomaly` | Flag outlier count for investigation |
| 6 | Monotonic numeric column | `trend` | Suggest sparkline for trend visualization |
| 7 | >10% null values | `filter` | Suggest show/hide empty rows filter |
| 8 | >100 rows in dataset | `filter` | Suggest enabling pagination (page size 25) |
| 9 | 2+ numeric columns | `visualization` | Suggest scatter-plot / correlation analysis |
| 10 | Status-like values (ok/error/active/...) | `visualization` | Suggest StatusBadge cell rendering |

## Types

```ts
type InsightType = 'aggregation' | 'visualization' | 'filter' | 'anomaly' | 'trend'

interface DataInsight {
  id: string
  type: InsightType
  title: string
  description: string
  confidence: number   // 0-1, used for sorting
  icon: string         // built-in icon name
  apply?: Record<string, unknown> // props to merge into DataTable
}
```

## Actionable Suggestions

Several insights include an `apply` object with DataTable props that implement the suggestion. For example, rule 1 returns `{ aggregations: { columnId: 'avg' } }` and rule 8 returns `{ paginated: true, pageSize: 25 }`. These can be spread directly onto the DataTable.

## Key Design Decisions

- **Zero dependencies** — all statistics (mean, std dev, outlier detection) are computed with pure JS
- **No API calls** — the engine is entirely client-side; your data never leaves the browser
- **Memoized** — insights recompute only when `data` or `columns` change
- **Status detection** — recognizes common status strings (ok, error, active, pending, healthy, degraded, etc.) via a built-in dictionary of 20 values
- **Type inference** — handles mixed-type columns gracefully using a 70% majority threshold

## Source

- Engine: `src/domain/data-table-ai.ts`
- Integration: `src/domain/data-table.tsx` (the `showSuggestions` prop)
