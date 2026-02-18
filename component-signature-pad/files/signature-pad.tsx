"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Undo2, Trash2, Download } from "lucide-react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Point {
  x: number
  y: number
  pressure: number
  timestamp: number
}

type Stroke = Point[]

export interface SignatureData {
  dataURL: string
  blob: Blob
  svg: string
  isEmpty: boolean
}

export interface SignaturePadRef {
  clear: () => void
  undo: () => void
  toDataURL: (type?: string) => string
  toBlob: (type?: string) => Promise<Blob>
  toSVG: () => string
  isEmpty: () => boolean
}

export interface SignaturePadProps {
  onSignature?: (data: SignatureData) => void
  penColor?: string
  penWidth?: number
  backgroundColor?: string
  placeholder?: string
  disabled?: boolean
  width?: number
  height?: number
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Compute distance between two points. */
function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

/** Compute velocity-based line width — faster movement = thinner line. */
function velocityWidth(
  prev: Point,
  curr: Point,
  baseWidth: number
): number {
  const dt = Math.max(curr.timestamp - prev.timestamp, 1)
  const dist = distance(prev, curr)
  const velocity = dist / dt // px per ms

  // Map velocity to width multiplier: slow (0) -> 1.4x, fast (2+) -> 0.4x
  const multiplier = Math.max(0.4, Math.min(1.4, 1.4 - velocity * 0.5))
  return baseWidth * multiplier
}

/** Mix pressure and velocity for final width. If real pressure is available, favor it. */
function strokeWidth(
  prev: Point,
  curr: Point,
  baseWidth: number
): number {
  const hasRealPressure = curr.pressure > 0 && curr.pressure < 1
  if (hasRealPressure) {
    // Blend: 70% pressure, 30% velocity
    const pressureW = baseWidth * (0.4 + curr.pressure * 1.0)
    const velocityW = velocityWidth(prev, curr, baseWidth)
    return pressureW * 0.7 + velocityW * 0.3
  }
  return velocityWidth(prev, curr, baseWidth)
}

/** Midpoint between two points. */
function midpoint(a: Point, b: Point): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/* -------------------------------------------------------------------------- */
/*  Canvas drawing                                                             */
/* -------------------------------------------------------------------------- */

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  color: string,
  baseWidth: number
): void {
  if (stroke.length === 0) return

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  if (stroke.length === 1) {
    // Single point — draw a dot
    const p = stroke[0]
    const radius = baseWidth / 2
    ctx.beginPath()
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (stroke.length === 2) {
    // Two points — draw a simple line
    const [a, b] = stroke
    ctx.lineWidth = strokeWidth(a, b, baseWidth)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    return
  }

  // Three or more points — use quadratic bezier through midpoints for smoothness
  for (let i = 1; i < stroke.length; i++) {
    const prev = stroke[i - 1]
    const curr = stroke[i]
    const width = strokeWidth(prev, curr, baseWidth)

    ctx.lineWidth = width
    ctx.beginPath()

    if (i === 1) {
      // First segment: line from first point to midpoint of first two
      const mid = midpoint(prev, curr)
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(mid.x, mid.y)
    } else {
      // Subsequent segments: quadratic curve from prev midpoint through prev point to curr midpoint
      const prevPrev = stroke[i - 2]
      const mid0 = midpoint(prevPrev, prev)
      const mid1 = midpoint(prev, curr)
      ctx.moveTo(mid0.x, mid0.y)
      ctx.quadraticCurveTo(prev.x, prev.y, mid1.x, mid1.y)
    }

    ctx.stroke()
  }

  // Draw final segment to the last point
  const last = stroke[stroke.length - 1]
  const secondLast = stroke[stroke.length - 2]
  const lastMid = midpoint(secondLast, last)
  ctx.lineWidth = strokeWidth(secondLast, last, baseWidth)
  ctx.beginPath()
  ctx.moveTo(lastMid.x, lastMid.y)
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

function redrawCanvas(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  backgroundColor: string,
  penColor: string,
  penWidth: number
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Fill background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Apply DPR scaling
  ctx.scale(dpr, dpr)
  ctx.restore()

  // Redraw does not use save/restore around strokes so scale persists
  const ctx2 = canvas.getContext("2d")
  if (!ctx2) return
  ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)

  for (const stroke of strokes) {
    drawStroke(ctx2, stroke, penColor, penWidth)
  }
}

/* -------------------------------------------------------------------------- */
/*  SVG export                                                                 */
/* -------------------------------------------------------------------------- */

function strokesToSVG(
  strokes: Stroke[],
  width: number,
  height: number,
  penColor: string,
  penWidth: number,
  backgroundColor: string
): string {
  const paths: string[] = []

  for (const stroke of strokes) {
    if (stroke.length === 0) continue

    if (stroke.length === 1) {
      const p = stroke[0]
      paths.push(
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${(penWidth / 2).toFixed(2)}" fill="${penColor}" />`
      )
      continue
    }

    // Build SVG path using quadratic bezier curves
    let d = `M ${stroke[0].x.toFixed(2)} ${stroke[0].y.toFixed(2)}`

    if (stroke.length === 2) {
      d += ` L ${stroke[1].x.toFixed(2)} ${stroke[1].y.toFixed(2)}`
    } else {
      for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1]
        const curr = stroke[i]

        if (i === 1) {
          const mid = midpoint(prev, curr)
          d += ` L ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`
        } else {
          const prevPrev = stroke[i - 2]
          const mid1 = midpoint(prev, curr)
          // Quadratic bezier: control point is prev, end is mid1
          void prevPrev // used for context only in canvas version
          d += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${mid1.x.toFixed(2)} ${mid1.y.toFixed(2)}`
        }
      }
      // Final segment to last point
      const last = stroke[stroke.length - 1]
      d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`
    }

    paths.push(
      `<path d="${d}" stroke="${penColor}" stroke-width="${penWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
    )
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `  <rect width="${width}" height="${height}" fill="${backgroundColor}" />`,
    ...paths.map((p) => `  ${p}`),
    `</svg>`,
  ].join("\n")
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

const SignaturePad = React.forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      onSignature,
      penColor = "#1a1a2e",
      penWidth = 2.5,
      backgroundColor = "#ffffff",
      placeholder = "Sign here",
      disabled = false,
      width,
      height = 200,
      className,
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const strokesRef = React.useRef<Stroke[]>([])
    const currentStrokeRef = React.useRef<Stroke>([])
    const isDrawingRef = React.useRef(false)

    const [strokeCount, setStrokeCount] = React.useState(0)
    const [canvasSize, setCanvasSize] = React.useState<{
      w: number
      h: number
    }>({ w: width ?? 600, h: height })

    const isEmpty = strokesRef.current.length === 0

    /* ---- Resize observer for responsive canvas ---- */
    React.useEffect(() => {
      if (width) {
        setCanvasSize({ w: width, h: height })
        return
      }

      const container = containerRef.current
      if (!container) return

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: cw } = entry.contentRect
          if (cw > 0) {
            setCanvasSize({ w: Math.round(cw), h: height })
          }
        }
      })

      observer.observe(container)
      return () => observer.disconnect()
    }, [width, height])

    /* ---- Apply DPR and redraw when size changes ---- */
    React.useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = canvasSize.w * dpr
      canvas.height = canvasSize.h * dpr

      redrawCanvas(
        canvas,
        strokesRef.current,
        backgroundColor,
        penColor,
        penWidth
      )
    }, [canvasSize, backgroundColor, penColor, penWidth])

    /* ---- Coordinate extraction ---- */
    const getPoint = React.useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current!
        const rect = canvas.getBoundingClientRect()
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          pressure: e.pressure ?? 0.5,
          timestamp: Date.now(),
        }
      },
      []
    )

    /* ---- Drawing handlers ---- */
    const handlePointerDown = React.useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled) return
        e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return

        // Capture pointer for reliable move/up events
        canvas.setPointerCapture(e.pointerId)

        isDrawingRef.current = true
        const point = getPoint(e)
        currentStrokeRef.current = [point]

        // Draw initial dot
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        ctx.fillStyle = penColor
        ctx.beginPath()
        ctx.arc(point.x, point.y, penWidth / 2, 0, Math.PI * 2)
        ctx.fill()
      },
      [disabled, getPoint, penColor, penWidth]
    )

    const handlePointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current || disabled) return
        e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return

        const point = getPoint(e)
        const current = currentStrokeRef.current

        // Skip if point is too close to previous (reduces noise)
        if (current.length > 0) {
          const last = current[current.length - 1]
          if (distance(last, point) < 1.5) return
        }

        current.push(point)

        // Draw the new segment incrementally
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        if (current.length >= 3) {
          const i = current.length - 1
          const prev = current[i - 1]
          const curr = current[i]
          const prevPrev = current[i - 2]
          const w = strokeWidth(prev, curr, penWidth)

          ctx.strokeStyle = penColor
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.lineWidth = w

          const mid0 = midpoint(prevPrev, prev)
          const mid1 = midpoint(prev, curr)

          ctx.beginPath()
          ctx.moveTo(mid0.x, mid0.y)
          ctx.quadraticCurveTo(prev.x, prev.y, mid1.x, mid1.y)
          ctx.stroke()
        } else if (current.length === 2) {
          const [a, b] = current
          const w = strokeWidth(a, b, penWidth)

          ctx.strokeStyle = penColor
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          ctx.lineWidth = w

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      },
      [disabled, getPoint, penColor, penWidth]
    )

    const handlePointerUp = React.useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return
        e.preventDefault()

        const canvas = canvasRef.current
        if (canvas) {
          canvas.releasePointerCapture(e.pointerId)
        }

        isDrawingRef.current = false

        const stroke = currentStrokeRef.current
        if (stroke.length > 0) {
          strokesRef.current = [...strokesRef.current, [...stroke]]
          setStrokeCount(strokesRef.current.length)

          // Full redraw for clean anti-aliased result
          if (canvas) {
            redrawCanvas(
              canvas,
              strokesRef.current,
              backgroundColor,
              penColor,
              penWidth
            )
          }
        }

        currentStrokeRef.current = []
      },
      [backgroundColor, penColor, penWidth]
    )

    /* ---- Actions ---- */
    const clear = React.useCallback(() => {
      strokesRef.current = []
      currentStrokeRef.current = []
      setStrokeCount(0)

      const canvas = canvasRef.current
      if (canvas) {
        redrawCanvas(canvas, [], backgroundColor, penColor, penWidth)
      }
    }, [backgroundColor, penColor, penWidth])

    const undo = React.useCallback(() => {
      if (strokesRef.current.length === 0) return
      strokesRef.current = strokesRef.current.slice(0, -1)
      setStrokeCount(strokesRef.current.length)

      const canvas = canvasRef.current
      if (canvas) {
        redrawCanvas(
          canvas,
          strokesRef.current,
          backgroundColor,
          penColor,
          penWidth
        )
      }
    }, [backgroundColor, penColor, penWidth])

    const toDataURL = React.useCallback(
      (type: string = "image/png"): string => {
        const canvas = canvasRef.current
        if (!canvas) return ""
        return canvas.toDataURL(type)
      },
      []
    )

    const toBlob = React.useCallback(
      (type: string = "image/png"): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const canvas = canvasRef.current
          if (!canvas) {
            reject(new Error("Canvas not available"))
            return
          }
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error("Failed to create blob"))
            },
            type
          )
        })
      },
      []
    )

    const toSVG = React.useCallback((): string => {
      return strokesToSVG(
        strokesRef.current,
        canvasSize.w,
        canvasSize.h,
        penColor,
        penWidth,
        backgroundColor
      )
    }, [canvasSize, penColor, penWidth, backgroundColor])

    const checkEmpty = React.useCallback((): boolean => {
      return strokesRef.current.length === 0
    }, [])

    /* ---- Export callback ---- */
    const emitSignature = React.useCallback(async () => {
      if (!onSignature) return

      const dataURL = toDataURL()
      const blob = await toBlob()
      const svg = toSVG()

      onSignature({
        dataURL,
        blob,
        svg,
        isEmpty: strokesRef.current.length === 0,
      })
    }, [onSignature, toDataURL, toBlob, toSVG])

    /* ---- Ref handle ---- */
    React.useImperativeHandle(
      ref,
      () => ({
        clear,
        undo,
        toDataURL,
        toBlob,
        toSVG,
        isEmpty: checkEmpty,
      }),
      [clear, undo, toDataURL, toBlob, toSVG, checkEmpty]
    )

    /* ---- Render ---- */
    return (
      <Card className={cn("w-full overflow-hidden", className)}>
        <CardContent className="space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={disabled || isEmpty}
                aria-label="Undo last stroke"
              >
                <Undo2 className="size-4" />
                Undo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clear}
                disabled={disabled || isEmpty}
                aria-label="Clear signature"
              >
                <Trash2 className="size-4" />
                Clear
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={emitSignature}
              disabled={disabled || isEmpty}
              aria-label="Export signature"
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>

          {/* Canvas container */}
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg border border-border"
            style={{
              height: canvasSize.h,
              backgroundColor,
            }}
          >
            {/* Placeholder */}
            {isEmpty && !isDrawingRef.current && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none text-lg text-muted-foreground/50 italic">
                  {placeholder}
                </span>
              </div>
            )}

            {/* Signing line */}
            <div
              className="pointer-events-none absolute bottom-8 left-8 right-8 border-b border-dashed border-muted-foreground/20"
              aria-hidden="true"
            />

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className={cn(
                "block touch-none",
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-crosshair"
              )}
              style={{
                width: canvasSize.w,
                height: canvasSize.h,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              aria-label="Signature drawing area"
              role="img"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isEmpty
                ? "Draw your signature above"
                : `${strokeCount} stroke${strokeCount !== 1 ? "s" : ""}`}
            </span>
            {!isEmpty && (
              <span className="text-emerald-600 dark:text-emerald-400">
                Signature captured
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

SignaturePad.displayName = "SignaturePad"

export { SignaturePad }
