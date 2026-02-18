"use client"

import * as React from "react"
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleDollarSign,
  Radio,
  TriangleAlert,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import type {
  ConnectionStatus,
  EventSeverity,
  RealtimeChartPoint,
  RealtimeEvent,
  RealtimeMetric,
  TrendDirection,
  WebSocketConfig,
} from "./types"

/* -------------------------------------------------------------------------- */
/*  Placeholder seed data                                                     */
/* -------------------------------------------------------------------------- */

const SEED_METRICS: RealtimeMetric[] = [
  { id: "revenue", label: "Revenue", value: 12847.32, previousValue: 12501.1, unit: "$", trend: "up" },
  { id: "users", label: "Active Users", value: 1247, previousValue: 1198, unit: "", trend: "up" },
  { id: "rps", label: "Requests/sec", value: 342, previousValue: 338, unit: "", trend: "up" },
  { id: "errors", label: "Error Rate", value: 0.12, previousValue: 0.15, unit: "%", trend: "down" },
]

const SEED_EVENTS: RealtimeEvent[] = [
  { id: "e1", type: "user", message: "New user registered — alice@example.com", timestamp: new Date().toISOString(), severity: "info" },
  { id: "e2", type: "payment", message: "Payment processed $149.99 — Order #8821", timestamp: new Date(Date.now() - 4000).toISOString(), severity: "success" },
  { id: "e3", type: "system", message: "API rate limit warning — 950/1000 req/min", timestamp: new Date(Date.now() - 12000).toISOString(), severity: "warning" },
  { id: "e4", type: "deploy", message: "Deployment completed — v2.14.0 production", timestamp: new Date(Date.now() - 30000).toISOString(), severity: "success" },
  { id: "e5", type: "error", message: "Database connection timeout — replica-02", timestamp: new Date(Date.now() - 45000).toISOString(), severity: "error" },
  { id: "e6", type: "user", message: "User upgraded to Pro plan — bob@acme.co", timestamp: new Date(Date.now() - 60000).toISOString(), severity: "info" },
  { id: "e7", type: "system", message: "Cache invalidated — product catalog", timestamp: new Date(Date.now() - 90000).toISOString(), severity: "info" },
  { id: "e8", type: "payment", message: "Refund issued $29.00 — Order #8790", timestamp: new Date(Date.now() - 120000).toISOString(), severity: "warning" },
]

function generateSeedChartData(count: number): RealtimeChartPoint[] {
  const now = Date.now()
  const points: RealtimeChartPoint[] = []
  let value = 300
  for (let i = 0; i < count; i++) {
    value += Math.round((Math.random() - 0.48) * 40)
    value = Math.max(100, Math.min(600, value))
    points.push({ timestamp: now - (count - i) * 2000, value })
  }
  return points
}

/* -------------------------------------------------------------------------- */
/*  Demo event generator                                                      */
/* -------------------------------------------------------------------------- */

const DEMO_EVENT_TEMPLATES: { message: string; severity: EventSeverity; type: string }[] = [
  { message: "New user registered", severity: "info", type: "user" },
  { message: "Payment processed $89.00", severity: "success", type: "payment" },
  { message: "Payment processed $249.99", severity: "success", type: "payment" },
  { message: "API rate limit warning", severity: "warning", type: "system" },
  { message: "Deployment completed — v2.14.1", severity: "success", type: "deploy" },
  { message: "Slow query detected — 3.2s", severity: "warning", type: "system" },
  { message: "User upgraded to Enterprise", severity: "info", type: "user" },
  { message: "SSL certificate renewed", severity: "success", type: "system" },
  { message: "Failed login attempt — brute force detected", severity: "error", type: "security" },
  { message: "Webhook delivery failed — retry scheduled", severity: "warning", type: "system" },
  { message: "New subscription — Team plan", severity: "success", type: "payment" },
  { message: "Memory usage spike — worker-03", severity: "warning", type: "system" },
]

let _eventCounter = 100

function generateDemoEvent(): RealtimeEvent {
  const template = DEMO_EVENT_TEMPLATES[Math.floor(Math.random() * DEMO_EVENT_TEMPLATES.length)]
  _eventCounter++
  return {
    id: `e${_eventCounter}`,
    type: template.type,
    message: template.message,
    timestamp: new Date().toISOString(),
    severity: template.severity,
  }
}

/* -------------------------------------------------------------------------- */
/*  useWebSocket hook (simulated)                                             */
/* -------------------------------------------------------------------------- */

/**
 * Simulated WebSocket hook for demo purposes.
 *
 * In production, replace the setInterval simulation with an actual WebSocket:
 *
 *   const ws = new WebSocket(config.url)
 *   ws.onmessage = (event) => {
 *     const data = JSON.parse(event.data)
 *     // Update metrics, events, chartData from data
 *   }
 *   ws.onclose = () => handleReconnect()
 *
 * The hook exposes the same shape regardless of transport.
 */
function useWebSocket(config: WebSocketConfig) {
  const [status, setStatus] = React.useState<ConnectionStatus>("connecting")
  const [metrics, setMetrics] = React.useState<RealtimeMetric[]>(SEED_METRICS)
  const [events, setEvents] = React.useState<RealtimeEvent[]>(SEED_EVENTS)
  const [chartData, setChartData] = React.useState<RealtimeChartPoint[]>(() => generateSeedChartData(30))
  const [retryCount, setRetryCount] = React.useState(0)

  const maxRetries = config.maxRetries ?? 5
  const reconnectInterval = config.reconnectInterval ?? 3000

  React.useEffect(() => {
    /* ---- Simulate initial connection delay ---- */
    const connectTimer = setTimeout(() => {
      setStatus("connected")
      setRetryCount(0)
    }, 800)

    return () => clearTimeout(connectTimer)
  }, [])

  React.useEffect(() => {
    if (status !== "connected") return

    /* ---- Simulate incoming metric ticks every 2s ---- */
    const tickInterval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const jitter = m.id === "errors"
            ? (Math.random() - 0.52) * 0.04
            : m.id === "revenue"
              ? (Math.random() - 0.45) * 120
              : (Math.random() - 0.45) * (m.value * 0.03)

          const newValue = Math.max(0, +(m.value + jitter).toFixed(m.id === "errors" ? 2 : m.id === "revenue" ? 2 : 0))
          const trend: TrendDirection = newValue > m.value ? "up" : newValue < m.value ? "down" : "flat"
          return { ...m, previousValue: m.value, value: newValue, trend }
        }),
      )

      /* ---- Append chart data point ---- */
      setChartData((prev) => {
        const last = prev[prev.length - 1]?.value ?? 300
        const next = Math.max(100, Math.min(600, last + Math.round((Math.random() - 0.48) * 40)))
        const updated = [...prev, { timestamp: Date.now(), value: next }]
        return updated.length > 60 ? updated.slice(-60) : updated
      })
    }, 2000)

    /* ---- Simulate incoming events every 3-6s ---- */
    const eventInterval = setInterval(() => {
      setEvents((prev) => {
        const updated = [generateDemoEvent(), ...prev]
        return updated.length > 50 ? updated.slice(0, 50) : updated
      })
    }, 3000 + Math.random() * 3000)

    return () => {
      clearInterval(tickInterval)
      clearInterval(eventInterval)
    }
  }, [status])

  /* ---- Simulated reconnection with exponential backoff ---- */
  const reconnect = React.useCallback(() => {
    if (retryCount >= maxRetries) {
      setStatus("error")
      return
    }

    setStatus("connecting")
    const delay = reconnectInterval * Math.pow(2, retryCount)

    const timer = setTimeout(() => {
      setRetryCount((r) => r + 1)
      setStatus("connected")
    }, delay)

    return () => clearTimeout(timer)
  }, [retryCount, maxRetries, reconnectInterval])

  return { status, metrics, events, chartData, reconnect }
}

/* -------------------------------------------------------------------------- */
/*  Connection status indicator                                               */
/* -------------------------------------------------------------------------- */

const statusConfig: Record<ConnectionStatus, { color: string; label: string }> = {
  connecting: { color: "bg-yellow-500", label: "Connecting..." },
  connected: { color: "bg-emerald-500", label: "Live" },
  disconnected: { color: "bg-zinc-400", label: "Disconnected" },
  error: { color: "bg-red-500", label: "Connection Error" },
}

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const cfg = statusConfig[status]
  return (
    <div className="flex items-center gap-2">
      {status === "connected" ? (
        <Wifi className="h-4 w-4 text-emerald-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={cn("relative flex h-2.5 w-2.5")}>
        {status === "connected" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", cfg.color)} />
        )}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", cfg.color)} />
      </span>
      <span className="text-sm font-medium text-muted-foreground">{cfg.label}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Trend icon                                                                */
/* -------------------------------------------------------------------------- */

function TrendIcon({ trend }: { trend: TrendDirection }) {
  if (trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
  if (trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-red-500" />
  return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
}

/* -------------------------------------------------------------------------- */
/*  Metric icon mapping                                                       */
/* -------------------------------------------------------------------------- */

const metricIcons: Record<string, React.ElementType> = {
  revenue: CircleDollarSign,
  users: Users,
  rps: Activity,
  errors: TriangleAlert,
}

/* -------------------------------------------------------------------------- */
/*  KPI metric card                                                           */
/* -------------------------------------------------------------------------- */

function MetricCard({ metric }: { metric: RealtimeMetric }) {
  const Icon = metricIcons[metric.id] ?? Activity

  const formattedValue =
    metric.unit === "$"
      ? `$${metric.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : metric.unit === "%"
        ? `${metric.value.toFixed(2)}%`
        : metric.value.toLocaleString("en-US")

  const delta = metric.previousValue !== 0
    ? (((metric.value - metric.previousValue) / metric.previousValue) * 100).toFixed(1)
    : "0.0"

  const deltaSign = Number(delta) > 0 ? "+" : ""

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>
        <div className="mt-1 flex items-center gap-1 text-xs">
          <TrendIcon trend={metric.trend} />
          <span
            className={cn(
              "font-medium",
              metric.trend === "up" && "text-emerald-600 dark:text-emerald-400",
              metric.trend === "down" && "text-red-600 dark:text-red-400",
              metric.trend === "flat" && "text-muted-foreground",
            )}
          >
            {deltaSign}{delta}%
          </span>
          <span className="text-muted-foreground">vs prev</span>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sparkline chart (SVG, zero dependencies)                                  */
/* -------------------------------------------------------------------------- */

function RealtimeSparkline({
  data,
  className,
}: {
  data: RealtimeChartPoint[]
  className?: string
}) {
  if (data.length < 2) return null

  const width = 600
  const height = 120
  const padding = 4

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data
    .map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2)
      const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  /* Build the area fill path */
  const firstX = padding
  const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
  const areaPath = `M ${firstX},${height} L ${points.split(" ").join(" L ")} L ${lastX.toFixed(1)},${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-gradient)" />
      <polyline
        points={points}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Current value dot */}
      {data.length > 0 && (() => {
        const lastIdx = data.length - 1
        const cx = padding + (lastIdx / (data.length - 1)) * (width - padding * 2)
        const cy = height - padding - ((data[lastIdx].value - min) / range) * (height - padding * 2)
        return (
          <circle
            cx={cx.toFixed(1)}
            cy={cy.toFixed(1)}
            r={4}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
        )
      })()}
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Event severity badge                                                      */
/* -------------------------------------------------------------------------- */

const severityConfig: Record<EventSeverity, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  info: { variant: "secondary", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  success: { variant: "secondary", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  warning: { variant: "secondary", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  error: { variant: "secondary", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
}

function SeverityBadge({ severity }: { severity: EventSeverity }) {
  const cfg = severityConfig[severity]
  return (
    <Badge variant={cfg.variant} className={cn("text-[10px] px-1.5 py-0 font-medium", cfg.className)}>
      {severity}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */
/*  Event feed                                                                */
/* -------------------------------------------------------------------------- */

function EventFeed({ events }: { events: RealtimeEvent[] }) {
  return (
    <ScrollArea className="h-[320px]">
      <div className="divide-y">
        {events.map((event) => {
          const time = new Date(event.timestamp)
          const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

          return (
            <div key={event.id} className="flex items-start gap-3 px-4 py-3">
              <SeverityBadge severity={event.severity} />
              <p className="flex-1 text-sm leading-snug">{event.message}</p>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{timeStr}</span>
            </div>
          )
        })}
        {events.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            No events yet
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main dashboard component                                                  */
/* -------------------------------------------------------------------------- */

interface RealtimeDashboardProps {
  /** WebSocket URL. In demo mode this is ignored but required for the hook shape. */
  url?: string
  className?: string
}

export function RealtimeDashboard({
  url = "wss://demo.example.com/ws",
  className,
}: RealtimeDashboardProps) {
  const { status, metrics, events, chartData, reconnect } = useWebSocket({
    url,
    reconnectInterval: 3000,
    maxRetries: 5,
  })

  return (
    <div className={cn("space-y-6", className)}>
      {/* ---- Header with connection status ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-time Dashboard</h2>
          <p className="text-sm text-muted-foreground">Live metrics updated via WebSocket</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionIndicator status={status} />
          {(status === "disconnected" || status === "error") && (
            <button
              onClick={reconnect}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* ---- KPI metric cards ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* ---- Chart + Event feed ---- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Sparkline chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Request Throughput</CardTitle>
              <div className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between pb-2">
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {chartData.length > 0 ? chartData[chartData.length - 1].value.toLocaleString("en-US") : "---"}
                </p>
                <p className="text-xs text-muted-foreground">requests / second</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Peak: {chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)).toLocaleString("en-US") : "---"}</p>
                <p>Min: {chartData.length > 0 ? Math.min(...chartData.map((d) => d.value)).toLocaleString("en-US") : "---"}</p>
              </div>
            </div>
            <RealtimeSparkline data={chartData} className="h-[140px]" />
          </CardContent>
        </Card>

        {/* Event feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Live Events</CardTitle>
              <Badge variant="outline" className="text-[10px] tabular-nums">
                {events.length} events
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <EventFeed events={events} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
