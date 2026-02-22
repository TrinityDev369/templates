/**
 * Mapbox GL Maps — Client Utilities
 *
 * Pure JavaScript utility functions for creating and controlling Mapbox GL
 * map instances. These functions are framework-agnostic and can be used
 * outside of React.
 *
 * @example
 * ```ts
 * import { createMapInstance, addMarkers, flyTo } from "@/integrations/mapbox/client";
 *
 * const map = createMapInstance(container, {
 *   accessToken: "pk.xxx",
 *   center: [-74.006, 40.7128],
 *   zoom: 12,
 * });
 *
 * const markers = addMarkers(map, [
 *   { id: "1", coordinates: [-74.006, 40.7128], title: "NYC", popup: true },
 * ]);
 *
 * flyTo(map, [-73.985, 40.748], 15);
 * ```
 */

import mapboxgl from "mapbox-gl";

import type { MapboxConfig, MarkerData } from "./types";

// ---------------------------------------------------------------------------
// Map Instance
// ---------------------------------------------------------------------------

/**
 * Create and return a new Mapbox GL map instance.
 *
 * Sets the access token globally and initializes the map in the provided
 * container element.
 *
 * @param container - The HTML element to render the map into.
 * @param config    - Mapbox configuration (access token, style, center, zoom).
 * @returns The initialized `mapboxgl.Map` instance.
 */
export function createMapInstance(
  container: HTMLElement,
  config: MapboxConfig,
): mapboxgl.Map {
  mapboxgl.accessToken = config.accessToken;

  const map = new mapboxgl.Map({
    container,
    style: config.style ?? "mapbox://styles/mapbox/streets-v12",
    center: config.center ?? [0, 0],
    zoom: config.zoom ?? 2,
  });

  // Add default navigation controls (zoom in/out, compass)
  map.addControl(new mapboxgl.NavigationControl(), "top-right");

  return map;
}

// ---------------------------------------------------------------------------
// Markers
// ---------------------------------------------------------------------------

/**
 * Add markers to a map instance with optional popups.
 *
 * Each marker is positioned at its `coordinates`. If `popup` is `true` and
 * a `title` or `description` is provided, a popup is attached that opens
 * on click.
 *
 * @param map     - The Mapbox GL map instance.
 * @param markers - Array of marker data to render.
 * @returns Array of created `mapboxgl.Marker` instances.
 */
export function addMarkers(
  map: mapboxgl.Map,
  markers: MarkerData[],
): mapboxgl.Marker[] {
  return markers.map((data) => {
    const marker = new mapboxgl.Marker({
      color: data.color,
    }).setLngLat(data.coordinates);

    // Attach popup if requested and content is available
    if (data.popup && (data.title || data.description)) {
      const popupHtml = [
        data.title ? `<strong>${data.title}</strong>` : "",
        data.description ? `<p>${data.description}</p>` : "",
      ]
        .filter(Boolean)
        .join("");

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);
      marker.setPopup(popup);
    }

    marker.addTo(map);
    return marker;
  });
}

// ---------------------------------------------------------------------------
// Camera Controls
// ---------------------------------------------------------------------------

/**
 * Smoothly fly the map camera to a new center position.
 *
 * @param map    - The Mapbox GL map instance.
 * @param center - Target center as `[longitude, latitude]`.
 * @param zoom   - Optional target zoom level.
 */
export function flyTo(
  map: mapboxgl.Map,
  center: [number, number],
  zoom?: number,
): void {
  map.flyTo({
    center,
    ...(zoom !== undefined ? { zoom } : {}),
    essential: true,
  });
}

/**
 * Adjust the map viewport to fit all provided markers within view.
 *
 * Creates a `LngLatBounds` from the marker coordinates and fits the map
 * to those bounds with optional padding.
 *
 * @param map     - The Mapbox GL map instance.
 * @param markers - Array of markers whose coordinates define the bounds.
 * @param padding - Padding in pixels around the fitted bounds. Defaults to 50.
 */
export function fitBounds(
  map: mapboxgl.Map,
  markers: MarkerData[],
  padding: number = 50,
): void {
  if (markers.length === 0) return;

  const bounds = new mapboxgl.LngLatBounds();

  for (const marker of markers) {
    bounds.extend(marker.coordinates);
  }

  map.fitBounds(bounds, { padding });
}
