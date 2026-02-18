"use client"

import * as React from "react"
import { useState, useMemo, useCallback } from "react"
import { Grid3X3, CalendarDays, GitCompareArrows, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { HeatmapCell, HeatmapConfig, HeatmapVariant, HeatmapProps } from "./types"

/* -------------------------------------------------------------------------- */
/*  Color interpolation                                                       */
/* -------------------------------------------------------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")
  )
}

function interpolateColor(scale: string[], t: number): string {
  if (scale.length === 0) return "#6b7280"
  if (scale.length === 1) return scale[0]

  const clamped = Math.max(0, Math.min(1, t))
  const segment = clamped * (scale.length - 1)
  const idx = Math.min(Math.floor(segment), scale.length - 2)
  const frac = segment - idx

  const [r1, g1, b1] = hexToRgb(scale[idx])
  const [r2, g2, b2] = hexToRgb(scale[idx + 1])

  return rgbToHex(
    r1 + (r2 - r1) * frac,
    g1 + (g2 - g1) * frac,
    b1 + (b2 - b1) * frac,
  )
}

/* -------------------------------------------------------------------------- */
/*  Summary statistics                                                        */
/* -------------------------------------------------------------------------- */

interface SummaryStats {
  total: number
  average: number
  max: number
  min: number
}

function computeStats(cells: HeatmapCell[]): SummaryStats {
  if (cells.length === 0) {
    return { total: 0, average: 0, max: 0, min: 0 }
  }
  const values = cells.map((c) => c.value)
  const total = values.reduce((s, v) => s + v, 0)
  return {
    total: Math.round(total * 100) / 100,
    average: Math.round((total / values.length) * 100) / 100,
    max: Math.max(...values),
    min: Math.min(...values),
  }
}

function StatsBar({ stats }: { stats: SummaryStats }) {
  const items = [
    { label: "Total", value: stats.total.toLocaleString() },
    { label: "Average", value: stats.average.toLocaleString() },
    { label: "Max", value: stats.max.toLocaleString() },
    { label: "Min", value: stats.min.toLocaleString() },
  ]
  return (
    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">{item.value}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Color legend                                                              */
/* -------------------------------------------------------------------------- */

function ColorLegend({
  scale,
  min,
  max,
}: {
  scale: string[]
  min: number
  max: number
}) {
  const gradient = scale.join(", ")
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{min}</span>
      <div
        className="h-3 w-32 rounded-sm"
        style={{ background: `linear-gradient(to right, ${gradient})` }}
      />
      <span>{max}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tooltip cell wrapper                                                      */
/* -------------------------------------------------------------------------- */

function CellWithTooltip({
  cell,
  rowLabel,
  colLabel,
  color,
  showValue,
  showTooltip,
  size,
  onClick,
  children,
}: {
  cell: HeatmapCell
  rowLabel: string
  colLabel: string
  color: string
  showValue: boolean
  showTooltip: boolean
  size: string
  onClick?: (cell: HeatmapCell) => void
  children?: React.ReactNode
}) {
  const cellContent = (
    <button
      type="button"
      className={cn(
        "rounded-sm transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1",
        size,
        onClick && "cursor-pointer",
      )}
      style={{ backgroundColor: color }}
      onClick={() => onClick?.(cell)}
      aria-label={`${rowLabel}, ${colLabel}: ${cell.label ?? cell.value}`}
    >
      {showValue && (
        <span className="text-[10px] font-medium leading-none text-white mix-blend-difference">
          {cell.label ?? cell.value}
        </span>
      )}
      {children}
    </button>
  )

  if (!showTooltip) return cellContent

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">
          {rowLabel} / {colLabel}
        </p>
        <p className="text-muted-foreground">
          Value: {cell.label ?? cell.value}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*  Grid variant                                                              */
/* -------------------------------------------------------------------------- */

function GridHeatmap({
  data,
  rows,
  columns,
  config,
  onCellClick,
}: HeatmapProps) {
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    for (const cell of data) {
      map.set(`${cell.row}-${cell.col}`, cell)
    }
    return map
  }, [data])

  const getColor = useCallback(
    (value: number) => {
      const range = config.maxValue - config.minValue
      const t = range === 0 ? 0.5 : (value - config.minValue) / range
      return interpolateColor(config.colorScale, t)
    },
    [config],
  )

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Column headers */}
        <div className="flex">
          <div className="w-20 shrink-0" />
          {columns.map((col) => (
            <div
              key={col}
              className="flex h-8 w-9 shrink-0 items-end justify-center pb-1"
            >
              <span className="text-[10px] font-medium text-muted-foreground leading-none">
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((rowLabel, ri) => (
          <div key={rowLabel} className="flex items-center">
            <div className="w-20 shrink-0 pr-2 text-right">
              <span className="text-xs font-medium text-muted-foreground">
                {rowLabel}
              </span>
            </div>
            {columns.map((colLabel, ci) => {
              const cell = cellMap.get(`${ri}-${ci}`)
              const value = cell?.value ?? config.minValue
              const color = getColor(value)
              const cellData: HeatmapCell = cell ?? {
                row: ri,
                col: ci,
                value: config.minValue,
              }
              return (
                <CellWithTooltip
                  key={`${ri}-${ci}`}
                  cell={cellData}
                  rowLabel={rowLabel}
                  colLabel={colLabel}
                  color={color}
                  showValue={config.showValues ?? false}
                  showTooltip={config.showTooltip ?? true}
                  size="h-8 w-9 shrink-0 flex items-center justify-center m-px"
                  onClick={onCellClick}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Calendar variant (GitHub-style contribution graph)                        */
/* -------------------------------------------------------------------------- */

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""]

function CalendarHeatmap({
  data,
  config,
  onCellClick,
}: HeatmapProps) {
  /* Build a lookup: key = "week-day" */
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    for (const cell of data) {
      map.set(`${cell.col}-${cell.row}`, cell)
    }
    return map
  }, [data])

  const getColor = useCallback(
    (value: number) => {
      if (value === 0) return "var(--muted, #e5e7eb)"
      const range = config.maxValue - config.minValue || 1
      const t = (value - config.minValue) / range
      return interpolateColor(config.colorScale, t)
    },
    [config],
  )

  /* Figure out month boundary columns for labels */
  const monthBoundaries = useMemo(() => {
    const boundaries: { label: string; col: number }[] = []
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 364)
    /* Adjust to Sunday */
    startDate.setDate(startDate.getDate() - startDate.getDay())

    let currentMonth = -1
    for (let week = 0; week < 53; week++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + week * 7)
      if (d.getMonth() !== currentMonth) {
        currentMonth = d.getMonth()
        boundaries.push({ label: MONTH_LABELS[currentMonth], col: week })
      }
    }
    return boundaries
  }, [])

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex">
          <div className="w-10 shrink-0" />
          {Array.from({ length: 53 }).map((_, week) => {
            const boundary = monthBoundaries.find((b) => b.col === week)
            return (
              <div
                key={week}
                className="flex h-4 w-[14px] shrink-0 items-center justify-start"
              >
                {boundary && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {boundary.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Day rows (0=Sun through 6=Sat) */}
        {Array.from({ length: 7 }).map((_, day) => (
          <div key={day} className="flex items-center">
            <div className="w-10 shrink-0 pr-1 text-right">
              <span className="text-[10px] text-muted-foreground">
                {DAY_LABELS[day]}
              </span>
            </div>
            {Array.from({ length: 53 }).map((_, week) => {
              const cell = cellMap.get(`${week}-${day}`)
              const value = cell?.value ?? 0
              const color = getColor(value)
              const cellData: HeatmapCell = cell ?? {
                row: day,
                col: week,
                value: 0,
              }
              return (
                <CellWithTooltip
                  key={`${week}-${day}`}
                  cell={cellData}
                  rowLabel={DAY_LABELS[day] || ["Sun", "Tue", "Thu", "Sat"][Math.floor(day / 2)]}
                  colLabel={`Week ${week + 1}`}
                  color={color}
                  showValue={false}
                  showTooltip={config.showTooltip ?? true}
                  size="h-[12px] w-[12px] shrink-0 m-px rounded-sm"
                  onClick={onCellClick}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Matrix variant (correlation matrix)                                       */
/* -------------------------------------------------------------------------- */

function MatrixHeatmap({
  data,
  rows,
  columns,
  config,
  onCellClick,
}: HeatmapProps) {
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>()
    for (const cell of data) {
      map.set(`${cell.row}-${cell.col}`, cell)
    }
    return map
  }, [data])

  const getColor = useCallback(
    (value: number) => {
      const range = config.maxValue - config.minValue
      const t = range === 0 ? 0.5 : (value - config.minValue) / range
      return interpolateColor(config.colorScale, t)
    },
    [config],
  )

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Column headers */}
        <div className="flex">
          <div className="w-28 shrink-0" />
          {columns.map((col) => (
            <div
              key={col}
              className="flex h-24 w-14 shrink-0 items-end justify-center pb-1"
            >
              <span
                className="text-[10px] font-medium text-muted-foreground leading-none origin-bottom-left -rotate-45 whitespace-nowrap"
              >
                {col}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((rowLabel, ri) => (
          <div key={rowLabel} className="flex items-center">
            <div className="w-28 shrink-0 pr-2 text-right">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {rowLabel}
              </span>
            </div>
            {columns.map((colLabel, ci) => {
              const cell = cellMap.get(`${ri}-${ci}`)
              const value = cell?.value ?? 0
              const color = getColor(value)
              const displayValue =
                value === 1 && ri === ci
                  ? "1.00"
                  : value.toFixed(2)
              const cellData: HeatmapCell = cell ?? {
                row: ri,
                col: ci,
                value: 0,
              }
              return (
                <CellWithTooltip
                  key={`${ri}-${ci}`}
                  cell={{ ...cellData, label: displayValue }}
                  rowLabel={rowLabel}
                  colLabel={colLabel}
                  color={color}
                  showValue={true}
                  showTooltip={config.showTooltip ?? true}
                  size="h-12 w-14 shrink-0 flex items-center justify-center m-px"
                  onClick={onCellClick}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data — Grid: Server response times by hour x day              */
/* -------------------------------------------------------------------------- */

const GRID_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const GRID_COLS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
)

function generateGridData(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  /* Deterministic pseudo-random seed based on row/col */
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 24; c++) {
      const base = r < 5 ? (c >= 8 && c <= 18 ? 180 : 50) : 30
      const variation = ((r * 24 + c) * 7 + 13) % 120
      const value = Math.max(10, base + variation - 60)
      cells.push({
        row: r,
        col: c,
        value,
        label: `${value}ms`,
      })
    }
  }
  return cells
}

const GRID_CONFIG: HeatmapConfig = {
  colorScale: ["#10b981", "#84cc16", "#eab308", "#f97316", "#ef4444"],
  minValue: 10,
  maxValue: 280,
  showValues: false,
  showTooltip: true,
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data — Calendar: 365 days of commit activity                  */
/* -------------------------------------------------------------------------- */

function generateCalendarData(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      /* Skip cells beyond the 365-day boundary for partial last week */
      if (week === 52 && day > 0) continue
      /* Pseudo-random with weekday weighting (less activity on weekends) */
      const seed = (week * 7 + day) * 17 + 41
      const isWeekend = day === 0 || day === 6
      const maxContrib = isWeekend ? 5 : 12
      const value = (seed * 31 + 7) % (maxContrib + 1)
      cells.push({
        row: day,
        col: week,
        value,
        label: `${value} contributions`,
      })
    }
  }
  return cells
}

const CALENDAR_CONFIG: HeatmapConfig = {
  colorScale: ["#065f46", "#059669", "#34d399", "#6ee7b7"],
  minValue: 0,
  maxValue: 12,
  showValues: false,
  showTooltip: true,
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data — Matrix: 6x6 feature correlation                       */
/* -------------------------------------------------------------------------- */

const MATRIX_LABELS = [
  "Revenue",
  "Users",
  "Sessions",
  "Bounce Rate",
  "Avg Duration",
  "Conversion",
]

/* Pre-defined correlation values for a realistic matrix */
const CORRELATION_MATRIX = [
  /*           Rev    Users  Sess   Bounce AvgDur Conv  */
  /* Rev   */ [1.0,   0.87,  0.74,  -0.42, 0.63,  0.91],
  /* Users */ [0.87,  1.0,   0.92,  -0.51, 0.58,  0.79],
  /* Sess  */ [0.74,  0.92,  1.0,   -0.68, 0.45,  0.72],
  /* Bounc */ [-0.42, -0.51, -0.68,  1.0,  -0.33, -0.55],
  /* AvgDu */ [0.63,  0.58,  0.45,  -0.33, 1.0,   0.61],
  /* Conv  */ [0.91,  0.79,  0.72,  -0.55, 0.61,  1.0],
]

function generateMatrixData(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      cells.push({
        row: r,
        col: c,
        value: CORRELATION_MATRIX[r][c],
      })
    }
  }
  return cells
}

const MATRIX_CONFIG: HeatmapConfig = {
  colorScale: ["#3b82f6", "#93c5fd", "#f9fafb", "#fca5a5", "#ef4444"],
  minValue: -1,
  maxValue: 1,
  showValues: true,
  showTooltip: true,
}

/* -------------------------------------------------------------------------- */
/*  Main Heatmap component                                                    */
/* -------------------------------------------------------------------------- */

export function Heatmap({
  data,
  rows,
  columns,
  config,
  title,
  description,
  onCellClick,
  className,
}: HeatmapProps) {
  const [activeVariant, setActiveVariant] = useState<HeatmapVariant>("grid")

  /* Memoize generated data for calendar and matrix variants */
  const calendarData = useMemo(() => generateCalendarData(), [])
  const matrixData = useMemo(() => generateMatrixData(), [])

  const activeData = useMemo(() => {
    switch (activeVariant) {
      case "grid":
        return data
      case "calendar":
        return calendarData
      case "matrix":
        return matrixData
    }
  }, [activeVariant, data, calendarData, matrixData])

  const stats = useMemo(() => computeStats(activeData), [activeData])

  return (
    <TooltipProvider delayDuration={100}>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={activeVariant}
            onValueChange={(v) => setActiveVariant(v as HeatmapVariant)}
          >
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="grid" className="gap-1.5">
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="gap-1.5">
                <GitCompareArrows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Matrix</span>
              </TabsTrigger>
            </TabsList>

            {/* Grid variant */}
            <TabsContent value="grid" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                <span>Server response times (ms) by hour and day of week</span>
              </div>
              <GridHeatmap
                data={data}
                rows={rows}
                columns={columns}
                config={config}
                onCellClick={onCellClick}
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <StatsBar stats={stats} />
                <ColorLegend
                  scale={config.colorScale}
                  min={config.minValue}
                  max={config.maxValue}
                />
              </div>
            </TabsContent>

            {/* Calendar variant */}
            <TabsContent value="calendar" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                <span>Contributions in the last year</span>
              </div>
              <CalendarHeatmap
                data={calendarData}
                rows={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                columns={[]}
                config={CALENDAR_CONFIG}
                onCellClick={onCellClick}
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <StatsBar stats={computeStats(calendarData)} />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Less</span>
                  {[0, 3, 6, 9, 12].map((level) => (
                    <div
                      key={level}
                      className="h-3 w-3 rounded-sm"
                      style={{
                        backgroundColor:
                          level === 0
                            ? "#e5e7eb"
                            : interpolateColor(
                                CALENDAR_CONFIG.colorScale,
                                level / 12,
                              ),
                      }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </TabsContent>

            {/* Matrix variant */}
            <TabsContent value="matrix" className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                <span>Feature correlation matrix (-1 to 1)</span>
              </div>
              <MatrixHeatmap
                data={matrixData}
                rows={MATRIX_LABELS}
                columns={MATRIX_LABELS}
                config={MATRIX_CONFIG}
                onCellClick={onCellClick}
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <StatsBar stats={computeStats(matrixData)} />
                <ColorLegend
                  scale={MATRIX_CONFIG.colorScale}
                  min={MATRIX_CONFIG.minValue}
                  max={MATRIX_CONFIG.maxValue}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Default export with placeholder data for immediate preview                */
/* -------------------------------------------------------------------------- */

export const GRID_PLACEHOLDER_DATA = generateGridData()
export const CALENDAR_PLACEHOLDER_DATA = generateCalendarData()
export const MATRIX_PLACEHOLDER_DATA = generateMatrixData()

export const HEATMAP_DEFAULT_PROPS: HeatmapProps = {
  data: GRID_PLACEHOLDER_DATA,
  rows: GRID_ROWS,
  columns: GRID_COLS,
  config: GRID_CONFIG,
  title: "Heatmap Visualization",
  description: "Switch between grid, calendar, and correlation matrix views",
}
