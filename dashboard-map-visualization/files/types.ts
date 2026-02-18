export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  value: number;
  category: string;
  color?: string;
}

export interface MapRegion {
  id: string;
  name: string;
  value: number;
  color: string;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface MapLegendItem {
  label: string;
  color: string;
  count: number;
}

export interface MapVisualizationProps {
  markers?: MapMarker[];
  regions?: MapRegion[];
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}
