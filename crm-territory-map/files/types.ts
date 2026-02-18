/* -------------------------------------------------------------------------- */
/*  Territory Map — Type Definitions                                          */
/* -------------------------------------------------------------------------- */

/** A sales representative assignable to territories. */
export interface SalesRep {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/** Aggregated performance metrics for a single territory. */
export interface TerritoryMetrics {
  /** Total revenue closed within the territory (USD). */
  revenue: number;
  /** Number of closed/active deals. */
  dealCount: number;
  /** Revenue quota target (USD). */
  quota: number;
  /** Computed quota attainment percentage (revenue / quota * 100). */
  quotaAttainment: number;
}

/**
 * A geographic sales territory rendered as a polygon on the map.
 *
 * `boundaries` follows the GeoJSON Polygon coordinate spec:
 * an array of linear rings where each ring is an array of [lng, lat] pairs.
 */
export interface Territory {
  id: string;
  name: string;
  /** Hex color used to fill the territory polygon. */
  color: string;
  /** GeoJSON Polygon coordinates — Array<Array<[lng, lat]>>. */
  boundaries: number[][][];
  /** The rep currently assigned, or null if unassigned. */
  assignedTo: SalesRep | null;
  /** Performance metrics for this territory. */
  metrics: TerritoryMetrics;
}

/** Configuration for the Mapbox GL map instance. */
export interface MapConfig {
  /** Map center as { lat, lng }. */
  center: { lat: number; lng: number };
  /** Initial zoom level (0-22). */
  zoom: number;
  /** Mapbox style URL (e.g. "mapbox://styles/mapbox/light-v11"). */
  style: string;
}
