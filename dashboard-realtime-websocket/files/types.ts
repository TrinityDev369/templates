/* -------------------------------------------------------------------------- */
/*  Connection                                                                */
/* -------------------------------------------------------------------------- */

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/* -------------------------------------------------------------------------- */
/*  Metrics                                                                   */
/* -------------------------------------------------------------------------- */

export type TrendDirection = "up" | "down" | "flat";

export interface RealtimeMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: TrendDirection;
}

/* -------------------------------------------------------------------------- */
/*  Events                                                                    */
/* -------------------------------------------------------------------------- */

export type EventSeverity = "info" | "success" | "warning" | "error";

export interface RealtimeEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: EventSeverity;
}

/* -------------------------------------------------------------------------- */
/*  Chart                                                                     */
/* -------------------------------------------------------------------------- */

export interface RealtimeChartPoint {
  timestamp: number;
  value: number;
}

/* -------------------------------------------------------------------------- */
/*  WebSocket config                                                          */
/* -------------------------------------------------------------------------- */

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxRetries?: number;
}
