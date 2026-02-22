/**
 * Mapbox GL Maps — Type Definitions
 *
 * Strongly-typed interfaces for map configuration, markers, popups,
 * map events, and the React component props.
 */

import type { CSSProperties } from "react";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration options for initializing a Mapbox GL map instance. */
export interface MapboxConfig {
  /** Mapbox public access token. */
  accessToken: string;
  /**
   * Map style URL.
   * @default "mapbox://styles/mapbox/streets-v12"
   */
  style?: string;
  /**
   * Initial center of the map as `[longitude, latitude]`.
   * @default [0, 0]
   */
  center?: [number, number];
  /**
   * Initial zoom level (0-22).
   * @default 2
   */
  zoom?: number;
}

// ---------------------------------------------------------------------------
// Markers
// ---------------------------------------------------------------------------

/** Data for a single map marker. */
export interface MarkerData {
  /** Unique identifier for the marker. */
  id: string;
  /** Marker position as `[longitude, latitude]`. */
  coordinates: [number, number];
  /** Marker color (CSS color string). Defaults to Mapbox blue. */
  color?: string;
  /** Title displayed in the popup header. */
  title?: string;
  /** Description displayed in the popup body. */
  description?: string;
  /** Whether to show a popup when the marker is clicked. */
  popup?: boolean;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Map interaction event emitted by the MapboxMap component. */
export interface MapEvent {
  /** The type of map interaction that occurred. */
  type: "click" | "move" | "zoom";
  /** Geographic coordinates where the event occurred as `[longitude, latitude]`. */
  lngLat: [number, number];
  /** Current zoom level at the time of the event. */
  zoom: number;
}

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

/** Props for the MapboxMap React component. */
export interface MapboxMapProps {
  /** Mapbox configuration (access token, style, center, zoom). */
  config: MapboxConfig;
  /** Array of markers to display on the map. */
  markers?: MarkerData[];
  /** Callback fired on map interaction events (click, move, zoom). */
  onMapEvent?: (event: MapEvent) => void;
  /** CSS class name applied to the map container div. */
  className?: string;
  /** Inline styles applied to the map container div. */
  style?: CSSProperties;
}
