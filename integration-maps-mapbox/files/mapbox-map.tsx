"use client";

/**
 * Mapbox GL Maps — React Component
 *
 * Interactive map component that initializes a Mapbox GL instance, renders
 * markers from props, and emits map events via a callback.
 *
 * @example
 * ```tsx
 * import { MapboxMap } from "@/integrations/mapbox";
 *
 * export default function LocationPage() {
 *   return (
 *     <MapboxMap
 *       config={{
 *         accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
 *         center: [-74.006, 40.7128],
 *         zoom: 12,
 *       }}
 *       markers={[
 *         { id: "hq", coordinates: [-74.006, 40.7128], title: "HQ", popup: true },
 *       ]}
 *       onMapEvent={(e) => console.log(e)}
 *       style={{ width: "100%", height: "500px" }}
 *     />
 *   );
 * }
 * ```
 */

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { createMapInstance, addMarkers } from "./client";
import type { MapboxMapProps, MapEvent } from "./types";

/**
 * Interactive Mapbox GL map with markers, popups, and event handling.
 *
 * Initializes the map on mount, cleans up on unmount, and re-renders
 * markers whenever the `markers` prop changes.
 */
export function MapboxMap({
  config,
  markers = [],
  onMapEvent,
  className,
  style,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Stable reference for the event callback
  const onMapEventRef = useRef(onMapEvent);
  onMapEventRef.current = onMapEvent;

  // ---------------------------------------------------------------------------
  // Event handler helper
  // ---------------------------------------------------------------------------

  const emitEvent = useCallback((type: MapEvent["type"], map: mapboxgl.Map, lngLat?: mapboxgl.LngLat) => {
    if (!onMapEventRef.current) return;

    const center = lngLat ?? map.getCenter();
    onMapEventRef.current({
      type,
      lngLat: [center.lng, center.lat],
      zoom: map.getZoom(),
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Initialize map on mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = createMapInstance(containerRef.current, config);
    mapRef.current = map;

    // Attach event listeners once the map is ready
    map.on("load", () => {
      map.on("click", (e: mapboxgl.MapMouseEvent) => {
        emitEvent("click", map, e.lngLat);
      });

      map.on("moveend", () => {
        emitEvent("move", map);
      });

      map.on("zoomend", () => {
        emitEvent("zoom", map);
      });
    });

    // Cleanup on unmount
    return () => {
      // Remove all markers
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];

      // Destroy the map instance
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Sync markers when the markers prop changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Wait until the map style is loaded before adding markers.
    // If the style is already loaded, proceed immediately.
    const syncMarkers = () => {
      // Remove existing markers
      for (const marker of markersRef.current) {
        marker.remove();
      }

      // Add new markers
      markersRef.current = addMarkers(map, markers);
    };

    if (map.isStyleLoaded()) {
      syncMarkers();
    } else {
      map.once("load", syncMarkers);
    }
  }, [markers]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "400px", ...style }}
    />
  );
}
