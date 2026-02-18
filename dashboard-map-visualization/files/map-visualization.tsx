'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Globe,
  BarChart3,
  Info,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type {
  MapMarker,
  MapRegion,
  MapLegendItem,
  MapVisualizationProps,
} from './types'

/* -------------------------------------------------------------------------- */
/*  Simplified world region SVG paths                                         */
/* -------------------------------------------------------------------------- */

interface RegionPath {
  id: string
  name: string
  d: string
}

const WORLD_REGIONS: RegionPath[] = [
  // North America
  {
    id: 'na-canada',
    name: 'Canada',
    d: 'M75,55 L85,48 L105,45 L125,42 L145,44 L155,50 L148,60 L135,65 L120,62 L105,58 L90,60 Z',
  },
  {
    id: 'na-usa',
    name: 'United States',
    d: 'M75,65 L90,62 L105,60 L120,64 L135,67 L148,62 L152,70 L148,80 L135,85 L115,82 L100,85 L85,80 L75,75 Z',
  },
  {
    id: 'na-mexico',
    name: 'Mexico',
    d: 'M75,80 L85,82 L100,87 L110,90 L105,98 L95,100 L85,95 L78,88 Z',
  },
  // Central America & Caribbean
  {
    id: 'ca-central',
    name: 'Central America',
    d: 'M105,98 L110,92 L118,95 L120,102 L115,108 L108,105 Z',
  },
  // South America
  {
    id: 'sa-north',
    name: 'Northern South America',
    d: 'M120,108 L135,105 L150,108 L155,115 L148,125 L138,128 L125,122 L118,115 Z',
  },
  {
    id: 'sa-brazil',
    name: 'Brazil',
    d: 'M138,128 L155,122 L165,130 L168,145 L160,160 L148,168 L135,162 L128,148 L130,135 Z',
  },
  {
    id: 'sa-south',
    name: 'Southern South America',
    d: 'M128,162 L135,165 L148,170 L145,185 L138,198 L130,195 L125,180 L122,170 Z',
  },
  // Europe
  {
    id: 'eu-west',
    name: 'Western Europe',
    d: 'M210,48 L220,44 L232,46 L238,52 L235,62 L228,68 L218,65 L210,58 Z',
  },
  {
    id: 'eu-north',
    name: 'Northern Europe',
    d: 'M225,30 L240,28 L258,32 L262,42 L250,46 L238,44 L228,40 Z',
  },
  {
    id: 'eu-east',
    name: 'Eastern Europe',
    d: 'M250,38 L262,35 L280,40 L290,50 L285,62 L270,65 L255,60 L245,52 Z',
  },
  {
    id: 'eu-south',
    name: 'Southern Europe',
    d: 'M218,68 L228,70 L242,68 L255,65 L258,72 L248,78 L235,80 L222,78 L215,74 Z',
  },
  // Africa
  {
    id: 'af-north',
    name: 'North Africa',
    d: 'M210,82 L225,80 L248,82 L270,85 L275,95 L260,102 L240,105 L220,100 L208,92 Z',
  },
  {
    id: 'af-west',
    name: 'West Africa',
    d: 'M208,102 L220,105 L232,108 L228,120 L218,125 L208,118 Z',
  },
  {
    id: 'af-east',
    name: 'East Africa',
    d: 'M265,105 L278,102 L285,110 L282,125 L272,130 L262,122 L258,112 Z',
  },
  {
    id: 'af-south',
    name: 'Southern Africa',
    d: 'M235,135 L252,132 L268,135 L272,150 L265,162 L250,168 L238,162 L232,148 Z',
  },
  // Asia
  {
    id: 'as-russia',
    name: 'Russia',
    d: 'M280,25 L310,22 L350,20 L385,22 L395,30 L388,42 L370,45 L345,42 L320,40 L295,38 L282,32 Z',
  },
  {
    id: 'as-middle-east',
    name: 'Middle East',
    d: 'M275,70 L290,68 L305,72 L310,82 L302,90 L288,92 L278,85 Z',
  },
  {
    id: 'as-central',
    name: 'Central Asia',
    d: 'M295,42 L315,40 L335,42 L340,52 L332,58 L318,60 L305,55 L298,48 Z',
  },
  {
    id: 'as-south',
    name: 'South Asia',
    d: 'M310,82 L325,78 L340,82 L345,95 L338,108 L325,112 L315,105 L308,92 Z',
  },
  {
    id: 'as-east',
    name: 'East Asia',
    d: 'M345,45 L365,42 L382,48 L388,58 L385,72 L372,78 L358,75 L348,65 L342,55 Z',
  },
  {
    id: 'as-southeast',
    name: 'Southeast Asia',
    d: 'M348,88 L362,85 L378,90 L385,100 L380,112 L368,118 L355,115 L345,105 L342,95 Z',
  },
  // Oceania
  {
    id: 'oc-australia',
    name: 'Australia',
    d: 'M358,145 L378,140 L398,142 L408,152 L405,168 L392,178 L375,180 L360,172 L355,160 Z',
  },
  {
    id: 'oc-nz',
    name: 'New Zealand',
    d: 'M418,175 L425,172 L428,180 L424,188 L418,185 Z',
  },
]

/* -------------------------------------------------------------------------- */
/*  Coordinate projection helpers                                             */
/* -------------------------------------------------------------------------- */

const SVG_WIDTH = 480
const SVG_HEIGHT = 220

function projectLat(lat: number): number {
  return ((90 - lat) / 180) * SVG_HEIGHT
}

function projectLng(lng: number): number {
  return ((lng + 180) / 360) * SVG_WIDTH
}

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_MARKERS: MapMarker[] = [
  { id: 'm1', lat: 40.7, lng: -74.0, label: 'New York', value: 847, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm2', lat: 51.5, lng: -0.1, label: 'London', value: 623, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm3', lat: 35.7, lng: 139.7, label: 'Tokyo', value: 512, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm4', lat: -23.5, lng: -46.6, label: 'Sao Paulo', value: 389, category: 'Growth', color: '#10b981' },
  { id: 'm5', lat: -33.9, lng: 151.2, label: 'Sydney', value: 245, category: 'Growth', color: '#10b981' },
  { id: 'm6', lat: 48.9, lng: 2.3, label: 'Paris', value: 418, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm7', lat: 55.8, lng: -3.2, label: 'Edinburgh', value: 156, category: 'Starter', color: '#f59e0b' },
  { id: 'm8', lat: 37.8, lng: -122.4, label: 'San Francisco', value: 534, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm9', lat: 19.4, lng: -99.1, label: 'Mexico City', value: 198, category: 'Growth', color: '#10b981' },
  { id: 'm10', lat: 1.3, lng: 103.8, label: 'Singapore', value: 367, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm11', lat: 52.5, lng: 13.4, label: 'Berlin', value: 298, category: 'Growth', color: '#10b981' },
  { id: 'm12', lat: 22.3, lng: 114.2, label: 'Hong Kong', value: 445, category: 'Enterprise', color: '#3b82f6' },
  { id: 'm13', lat: -34.6, lng: -58.4, label: 'Buenos Aires', value: 132, category: 'Starter', color: '#f59e0b' },
  { id: 'm14', lat: 25.2, lng: 55.3, label: 'Dubai', value: 278, category: 'Growth', color: '#10b981' },
  { id: 'm15', lat: 28.6, lng: 77.2, label: 'New Delhi', value: 356, category: 'Growth', color: '#10b981' },
  { id: 'm16', lat: 59.3, lng: 18.1, label: 'Stockholm', value: 189, category: 'Starter', color: '#f59e0b' },
  { id: 'm17', lat: -1.3, lng: 36.8, label: 'Nairobi', value: 94, category: 'Starter', color: '#f59e0b' },
  { id: 'm18', lat: 31.2, lng: 121.5, label: 'Shanghai', value: 478, category: 'Enterprise', color: '#3b82f6' },
]

const PLACEHOLDER_REGIONS: MapRegion[] = [
  { id: 'na-usa', name: 'United States', value: 2840, color: '#3b82f6' },
  { id: 'eu-west', name: 'Western Europe', value: 1920, color: '#6366f1' },
  { id: 'as-east', name: 'East Asia', value: 1650, color: '#8b5cf6' },
  { id: 'sa-brazil', name: 'Brazil', value: 580, color: '#10b981' },
  { id: 'oc-australia', name: 'Australia', value: 420, color: '#14b8a6' },
  { id: 'as-south', name: 'South Asia', value: 710, color: '#f59e0b' },
  { id: 'as-southeast', name: 'Southeast Asia', value: 540, color: '#f97316' },
  { id: 'af-east', name: 'East Africa', value: 180, color: '#ef4444' },
  { id: 'eu-north', name: 'Northern Europe', value: 820, color: '#6366f1' },
  { id: 'as-middle-east', name: 'Middle East', value: 460, color: '#f59e0b' },
]

/* -------------------------------------------------------------------------- */
/*  Tooltip component                                                         */
/* -------------------------------------------------------------------------- */

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: { label: string; value: number; category?: string } | null
}

/* -------------------------------------------------------------------------- */
/*  MapVisualization component                                                */
/* -------------------------------------------------------------------------- */

export function MapVisualization({
  markers = PLACEHOLDER_MARKERS,
  regions = PLACEHOLDER_REGIONS,
  onMarkerClick,
  className,
}: MapVisualizationProps) {
  const [viewport, setViewport] = useState({ zoom: 1, panX: 0, panY: 0 })
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null)

  /* ------ region color map for fast lookup ------ */
  const regionColorMap = useMemo(() => {
    const map = new Map<string, { color: string; value: number; name: string }>()
    for (const r of regions) {
      map.set(r.id, { color: r.color, value: r.value, name: r.name })
    }
    return map
  }, [regions])

  /* ------ legend items derived from markers ------ */
  const legendItems: MapLegendItem[] = useMemo(() => {
    const catMap = new Map<string, { color: string; count: number }>()
    for (const m of markers) {
      const existing = catMap.get(m.category)
      if (existing) {
        existing.count += 1
      } else {
        catMap.set(m.category, { color: m.color ?? '#6b7280', count: 1 })
      }
    }
    return Array.from(catMap.entries()).map(([label, { color, count }]) => ({
      label,
      color,
      count,
    }))
  }, [markers])

  /* ------ stats ------ */
  const totalUsers = useMemo(
    () => markers.reduce((sum, m) => sum + m.value, 0),
    [markers],
  )

  const topRegions = useMemo(
    () => [...regions].sort((a, b) => b.value - a.value).slice(0, 5),
    [regions],
  )

  /* ------ zoom controls ------ */
  const handleZoomIn = useCallback(() => {
    setViewport((v) => ({ ...v, zoom: Math.min(v.zoom * 1.4, 5) }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewport((v) => ({
      ...v,
      zoom: Math.max(v.zoom / 1.4, 0.5),
    }))
  }, [])

  const handleReset = useCallback(() => {
    setViewport({ zoom: 1, panX: 0, panY: 0 })
  }, [])

  /* ------ tooltip handlers ------ */
  const showTooltip = useCallback(
    (
      e: React.MouseEvent,
      content: { label: string; value: number; category?: string },
    ) => {
      const rect = (e.currentTarget as Element)
        .closest('svg')
        ?.getBoundingClientRect()
      if (!rect) return
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content,
      })
    },
    [],
  )

  const hideTooltip = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }))
  }, [])

  /* ------ projected marker positions ------ */
  const projectedMarkers = useMemo(
    () =>
      markers.map((m) => ({
        ...m,
        cx: projectLng(m.lng),
        cy: projectLat(m.lat),
      })),
    [markers],
  )

  /* ------ compute viewBox for zoom ------ */
  const vbWidth = SVG_WIDTH / viewport.zoom
  const vbHeight = SVG_HEIGHT / viewport.zoom
  const vbX = (SVG_WIDTH - vbWidth) / 2 + viewport.panX
  const vbY = (SVG_HEIGHT - vbHeight) / 2 + viewport.panY
  const viewBox = `${vbX} ${vbY} ${vbWidth} ${vbHeight}`

  /* ------ max region value for opacity scaling ------ */
  const maxRegionValue = useMemo(
    () => Math.max(...regions.map((r) => r.value), 1),
    [regions],
  )

  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-4', className)}>
      {/* ------------------------------------------------------------------ */}
      {/*  Map Card (spans 3 cols on large screens)                          */}
      {/* ------------------------------------------------------------------ */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Global Distribution</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
              aria-label="Reset view"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30">
            {/* SVG Map */}
            <svg
              viewBox={viewBox}
              className="h-auto w-full"
              style={{ minHeight: 320 }}
              role="img"
              aria-label="Interactive world map showing user distribution"
            >
              {/* Background */}
              <rect
                x={-10}
                y={-10}
                width={SVG_WIDTH + 20}
                height={SVG_HEIGHT + 20}
                className="fill-background"
              />

              {/* Grid lines */}
              {Array.from({ length: 7 }, (_, i) => {
                const x = (i * SVG_WIDTH) / 6
                return (
                  <line
                    key={`vg-${i}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={SVG_HEIGHT}
                    className="stroke-muted-foreground/10"
                    strokeWidth={0.5}
                  />
                )
              })}
              {Array.from({ length: 5 }, (_, i) => {
                const y = (i * SVG_HEIGHT) / 4
                return (
                  <line
                    key={`hg-${i}`}
                    x1={0}
                    y1={y}
                    x2={SVG_WIDTH}
                    y2={y}
                    className="stroke-muted-foreground/10"
                    strokeWidth={0.5}
                  />
                )
              })}

              {/* Equator */}
              <line
                x1={0}
                y1={SVG_HEIGHT / 2}
                x2={SVG_WIDTH}
                y2={SVG_HEIGHT / 2}
                className="stroke-muted-foreground/20"
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />

              {/* World regions */}
              {WORLD_REGIONS.map((region) => {
                const data = regionColorMap.get(region.id)
                const opacity = data
                  ? 0.2 + (data.value / maxRegionValue) * 0.6
                  : 0.08
                const fill = data ? data.color : 'currentColor'

                return (
                  <path
                    key={region.id}
                    d={region.d}
                    fill={fill}
                    fillOpacity={opacity}
                    className={cn(
                      'stroke-muted-foreground/30 transition-all duration-200',
                      data && 'cursor-pointer hover:brightness-110',
                    )}
                    strokeWidth={0.5}
                    onMouseMove={(e) => {
                      if (data) {
                        showTooltip(e, {
                          label: data.name,
                          value: data.value,
                        })
                      }
                    }}
                    onMouseLeave={hideTooltip}
                  />
                )
              })}

              {/* Markers */}
              {projectedMarkers.map((m) => {
                const isActive = activeMarkerId === m.id
                const markerColor = m.color ?? '#6b7280'
                const radius = Math.max(
                  2,
                  Math.min(5, 1.5 + (m.value / 200)),
                )

                return (
                  <g key={m.id}>
                    {/* Pulse ring for active marker */}
                    {isActive && (
                      <circle
                        cx={m.cx}
                        cy={m.cy}
                        r={radius + 4}
                        fill="none"
                        stroke={markerColor}
                        strokeWidth={1}
                        opacity={0.4}
                      >
                        <animate
                          attributeName="r"
                          from={radius + 2}
                          to={radius + 8}
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from={0.5}
                          to={0}
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Outer glow */}
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r={radius + 1.5}
                      fill={markerColor}
                      opacity={0.2}
                    />

                    {/* Main dot */}
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r={radius}
                      fill={markerColor}
                      className="cursor-pointer transition-all duration-150 hover:brightness-125"
                      stroke="hsl(var(--background))"
                      strokeWidth={0.6}
                      onMouseMove={(e) =>
                        showTooltip(e, {
                          label: m.label,
                          value: m.value,
                          category: m.category,
                        })
                      }
                      onMouseLeave={() => {
                        hideTooltip()
                        setActiveMarkerId(null)
                      }}
                      onMouseEnter={() => setActiveMarkerId(m.id)}
                      onClick={() => onMarkerClick?.(m)}
                    />
                  </g>
                )
              })}
            </svg>

            {/* Tooltip overlay */}
            {tooltip.visible && tooltip.content && (
              <div
                className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md"
                style={{
                  left: tooltip.x + 12,
                  top: tooltip.y - 8,
                }}
              >
                <p className="font-semibold text-popover-foreground">
                  {tooltip.content.label}
                </p>
                <p className="text-muted-foreground">
                  {tooltip.content.value.toLocaleString()} users
                </p>
                {tooltip.content.category && (
                  <p className="text-muted-foreground">
                    {tooltip.content.category}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/*  Stats sidebar                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4">
        {/* Total markers */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Across {markers.length} locations
            </p>
          </CardContent>
        </Card>

        {/* Top regions */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Top Regions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRegions.map((region) => {
              const pct = Math.round((region.value / totalUsers) * 100)
              return (
                <div key={region.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{region.name}</span>
                    <span className="text-muted-foreground">
                      {region.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: region.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {legendItems.map((item) => {
              const catTotal = markers
                .filter((m) => m.category === item.label)
                .reduce((sum, m) => sum + m.value, 0)
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">
                      {catTotal.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.count} locations
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Info note */}
        <Card>
          <CardContent className="flex items-start gap-2 pt-4">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Marker size indicates relative user count. Hover regions and
              markers for details. Use zoom controls to explore.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
