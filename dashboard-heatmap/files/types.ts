/* -------------------------------------------------------------------------- */
/*  Heatmap types                                                             */
/* -------------------------------------------------------------------------- */

export interface HeatmapCell {
  /** Row index or label key */
  row: number
  /** Column index or label key */
  col: number
  /** Numeric intensity value */
  value: number
  /** Optional display label for the cell */
  label?: string
}

export interface HeatmapConfig {
  /** Color stops from low to high values (CSS color strings) */
  colorScale: string[]
  /** Minimum value in the data range */
  minValue: number
  /** Maximum value in the data range */
  maxValue: number
  /** Whether to display numeric values inside cells */
  showValues?: boolean
  /** Whether to show a tooltip on hover */
  showTooltip?: boolean
}

export type HeatmapVariant = "grid" | "calendar" | "matrix"

export interface HeatmapProps {
  /** Cell data entries */
  data: HeatmapCell[]
  /** Row labels (displayed on the left axis) */
  rows: string[]
  /** Column labels (displayed on the top axis) */
  columns: string[]
  /** Visual and data-range configuration */
  config: HeatmapConfig
  /** Card title */
  title?: string
  /** Card description text */
  description?: string
  /** Called when a cell is clicked */
  onCellClick?: (cell: HeatmapCell) => void
  /** Additional CSS class names */
  className?: string
}
