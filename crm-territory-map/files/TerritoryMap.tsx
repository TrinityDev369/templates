'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type CSSProperties,
  type DragEvent,
} from 'react';
import mapboxgl from 'mapbox-gl';
import type { Territory, SalesRep, MapConfig } from './types';
import {
  calculateQuotaAttainment,
  getAttainmentColor,
  sortTerritoriesByAttainment,
  formatCurrency,
} from './territory-utils';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_CONFIG: MapConfig = {
  center: { lat: 39.8283, lng: -98.5795 }, // geographic center of US
  zoom: 4,
  style: 'mapbox://styles/mapbox/light-v11',
};

const TERRITORY_SOURCE = 'territories-source';
const TERRITORY_FILL_LAYER = 'territories-fill';
const TERRITORY_LINE_LAYER = 'territories-line';

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

export interface TerritoryMapProps {
  /** Array of sales territories to render on the map. */
  territories: Territory[];
  /** Available sales reps that can be assigned to territories. */
  reps: SalesRep[];
  /** Your Mapbox GL access token. */
  mapboxToken: string;
  /** Partial map configuration overrides. */
  config?: Partial<MapConfig>;
  /** Fires when a territory polygon is clicked. */
  onTerritoryClick?: (territory: Territory) => void;
  /** Fires when a rep is assigned to a territory. */
  onAssign?: (territoryId: string, repId: string) => void;
  /** Additional CSS class names for the root container. */
  className?: string;
  /** Inline styles for the root container. */
  style?: CSSProperties;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Build a GeoJSON FeatureCollection from territories. */
function buildGeoJSON(territories: Territory[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: territories.map((t) => ({
      type: 'Feature' as const,
      id: t.id,
      properties: {
        id: t.id,
        name: t.name,
        color: getAttainmentColor(calculateQuotaAttainment(t)),
        revenue: t.metrics.revenue,
        dealCount: t.metrics.dealCount,
        quota: t.metrics.quota,
        quotaAttainment: calculateQuotaAttainment(t),
        assignedTo: t.assignedTo?.name ?? 'Unassigned',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: t.boundaries,
      },
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*  Legend Component                                                          */
/* -------------------------------------------------------------------------- */

function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-semibold text-gray-700">Quota Attainment</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: '#22c55e' }}
          />
          <span className="text-xs text-gray-600">{'>'}100%</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: '#eab308' }}
          />
          <span className="text-xs text-gray-600">50 - 100%</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: '#ef4444' }}
          />
          <span className="text-xs text-gray-600">{'<'}50%</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Popup Component (rendered as HTML string for Mapbox)                      */
/* -------------------------------------------------------------------------- */

function buildPopupHTML(territory: Territory): string {
  const attainment = calculateQuotaAttainment(territory);
  const color = getAttainmentColor(attainment);
  return `
    <div style="font-family: system-ui, sans-serif; min-width: 200px;">
      <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">${territory.name}</h3>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${color};"></span>
        <span style="font-size: 12px; color: #555;">${attainment.toFixed(1)}% attainment</span>
      </div>
      <div style="font-size: 12px; color: #666; line-height: 1.6;">
        <div><strong>Assigned:</strong> ${territory.assignedTo?.name ?? 'Unassigned'}</div>
        <div><strong>Revenue:</strong> ${formatCurrency(territory.metrics.revenue)}</div>
        <div><strong>Deals:</strong> ${territory.metrics.dealCount}</div>
        <div><strong>Quota:</strong> ${formatCurrency(territory.metrics.quota)}</div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/*  Sidebar Panel                                                            */
/* -------------------------------------------------------------------------- */

interface SidebarProps {
  territories: Territory[];
  reps: SalesRep[];
  selectedId: string | null;
  onSelect: (territory: Territory) => void;
  onAssign: (territoryId: string, repId: string) => void;
  onRepDragStart: (e: DragEvent<HTMLDivElement>, repId: string) => void;
}

function Sidebar({
  territories,
  reps,
  selectedId,
  onSelect,
  onAssign,
  onRepDragStart,
}: SidebarProps) {
  const sorted = useMemo(() => sortTerritoriesByAttainment(territories), [territories]);

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Rep pool */}
      <div className="border-b border-gray-200 p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Sales Reps
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {reps.map((rep) => (
            <div
              key={rep.id}
              draggable
              onDragStart={(e) => onRepDragStart(e, rep.id)}
              className="flex cursor-grab items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 active:cursor-grabbing"
              title={`Drag to assign ${rep.name}`}
            >
              {rep.avatar ? (
                <img
                  src={rep.avatar}
                  alt={rep.name}
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                  {rep.name.charAt(0)}
                </span>
              )}
              <span>{rep.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Territory list */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Territories ({territories.length})
        </h3>
        <div className="flex flex-col">
          {sorted.map((territory) => {
            const attainment = calculateQuotaAttainment(territory);
            const attColor = getAttainmentColor(attainment);
            const isSelected = selectedId === territory.id;

            return (
              <TerritoryRow
                key={territory.id}
                territory={territory}
                attainment={attainment}
                attainmentColor={attColor}
                isSelected={isSelected}
                reps={reps}
                onSelect={onSelect}
                onAssign={onAssign}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Territory Row                                                             */
/* -------------------------------------------------------------------------- */

interface TerritoryRowProps {
  territory: Territory;
  attainment: number;
  attainmentColor: string;
  isSelected: boolean;
  reps: SalesRep[];
  onSelect: (territory: Territory) => void;
  onAssign: (territoryId: string, repId: string) => void;
}

function TerritoryRow({
  territory,
  attainment,
  attainmentColor,
  isSelected,
  reps,
  onSelect,
  onAssign,
}: TerritoryRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const repId = e.dataTransfer.getData('text/plain');
      if (repId) {
        onAssign(territory.id, repId);
      }
      setIsDragOver(false);
    },
    [territory.id, onAssign],
  );

  return (
    <div
      className={[
        'cursor-pointer border-b border-gray-100 px-3 py-2.5 transition-colors',
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
        isDragOver ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : '',
      ].join(' ')}
      onClick={() => onSelect(territory)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: attainmentColor }}
            />
            <span className="truncate text-sm font-medium text-gray-900">
              {territory.name}
            </span>
          </div>
          <p className="mt-0.5 pl-[18px] text-xs text-gray-500">
            {territory.assignedTo?.name ?? 'Unassigned'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: attainmentColor }}>
            {attainment.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">{formatCurrency(territory.metrics.revenue)}</p>
        </div>
      </div>

      {/* Assignment dropdown */}
      <div className="mt-1.5 pl-[18px]">
        <select
          className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          value={territory.assignedTo?.id ?? ''}
          onChange={(e) => {
            if (e.target.value) {
              onAssign(territory.id, e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Unassigned</option>
          {reps.map((rep) => (
            <option key={rep.id} value={rep.id}>
              {rep.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                           */
/* -------------------------------------------------------------------------- */

export function TerritoryMap({
  territories,
  reps,
  mapboxToken,
  config,
  onTerritoryClick,
  onAssign,
  className,
  style,
}: TerritoryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);

  const mergedConfig = useMemo<MapConfig>(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config],
  );

  const geojson = useMemo(() => buildGeoJSON(territories), [territories]);

  /* ---- Initialize map ---- */

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mergedConfig.style,
      center: [mergedConfig.center.lng, mergedConfig.center.lat],
      zoom: mergedConfig.zoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      /* Source */
      map.addSource(TERRITORY_SOURCE, {
        type: 'geojson',
        data: geojson,
      });

      /* Fill layer */
      map.addLayer({
        id: TERRITORY_FILL_LAYER,
        type: 'fill',
        source: TERRITORY_SOURCE,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.35,
        },
      });

      /* Line layer */
      map.addLayer({
        id: TERRITORY_LINE_LAYER,
        type: 'line',
        source: TERRITORY_SOURCE,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      /* Hover cursor */
      map.on('mouseenter', TERRITORY_FILL_LAYER, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', TERRITORY_FILL_LAYER, () => {
        map.getCanvas().style.cursor = '';
      });

      /* Click handler */
      map.on('click', TERRITORY_FILL_LAYER, (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const props = feature.properties;
        if (!props) return;

        const territoryId = props.id as string;
        const territory = territories.find((t) => t.id === territoryId);
        if (!territory) return;

        setSelectedTerritoryId(territoryId);
        onTerritoryClick?.(territory);

        /* Popup */
        if (popupRef.current) popupRef.current.remove();

        const popup = new mapboxgl.Popup({ offset: 15, maxWidth: '280px' })
          .setLngLat(e.lngLat)
          .setHTML(buildPopupHTML(territory))
          .addTo(map);

        popupRef.current = popup;
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken]);

  /* ---- Sync GeoJSON data when territories change ---- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(TERRITORY_SOURCE);
    if (source && 'setData' in source) {
      (source as mapboxgl.GeoJSONSource).setData(geojson);
    }
  }, [geojson]);

  /* ---- Handle assignment ---- */

  const handleAssign = useCallback(
    (territoryId: string, repId: string) => {
      onAssign?.(territoryId, repId);
    },
    [onAssign],
  );

  /* ---- Handle sidebar territory select ---- */

  const handleSidebarSelect = useCallback(
    (territory: Territory) => {
      setSelectedTerritoryId(territory.id);
      onTerritoryClick?.(territory);

      const map = mapRef.current;
      if (!map || !territory.boundaries[0] || territory.boundaries[0].length === 0) return;

      /* Fly to territory centroid */
      const ring = territory.boundaries[0];
      let lngSum = 0;
      let latSum = 0;
      for (const coord of ring) {
        lngSum += coord[0];
        latSum += coord[1];
      }
      const centroid: [number, number] = [lngSum / ring.length, latSum / ring.length];

      map.flyTo({ center: centroid, zoom: 6, duration: 1000 });
    },
    [onTerritoryClick],
  );

  /* ---- Rep drag start for sidebar ---- */

  const handleRepDragStart = useCallback((e: DragEvent<HTMLDivElement>, repId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', repId);
  }, []);

  return (
    <div
      className={['flex h-[600px] overflow-hidden rounded-lg border border-gray-200 shadow-sm', className].filter(Boolean).join(' ')}
      style={style}
    >
      {/* Sidebar panel */}
      <Sidebar
        territories={territories}
        reps={reps}
        selectedId={selectedTerritoryId}
        onSelect={handleSidebarSelect}
        onAssign={handleAssign}
        onRepDragStart={handleRepDragStart}
      />

      {/* Map container */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="h-full w-full" />
        <Legend />
      </div>
    </div>
  );
}

export default TerritoryMap;
