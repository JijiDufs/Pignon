"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GeoJSONSource, Map as MapLibreMap, Marker, PositionAnchor } from "maplibre-gl";
import { OVERVIEW, pignonMapStyle } from "@/lib/map-style";
import { cn } from "@/lib/utils";

type MapLibre = typeof import("maplibre-gl");

interface MapContextValue {
  map: MapLibreMap;
  lib: MapLibre;
}

const MapContext = createContext<MapContextValue | null>(null);

/** The MapLibre map, once loaded. Null outside a <PignonMap> or before the tiles are ready. */
export function useMap(): MapLibreMap | null {
  return useContext(MapContext)?.map ?? null;
}

interface PignonMapProps {
  /** Initial centre. Move the camera afterwards with `useMap()` (flyTo, fitBounds). */
  center: { lng: number; lat: number };
  zoom?: number;
  /** Initial tilt and rotation of the camera. Defaults to the tilted overview. */
  pitch?: number;
  bearing?: number;
  /** False for a decorative, non-draggable map */
  interactive?: boolean;
  /** Accessible name of the map region */
  label?: string;
  onReady?: (map: MapLibreMap) => void;
  className?: string;
  /** Layers, markers and overlays (see map-layers.tsx) */
  children?: React.ReactNode;
}

/**
 * The city as a white 3D model. Fills its parent (give the parent a size).
 * MapLibre is loaded in the browser only; children render once the map is ready.
 */
export function PignonMap({
  center,
  zoom = 13,
  pitch = OVERVIEW.pitch,
  bearing = OVERVIEW.bearing,
  interactive = true,
  label = "Carte de la zone",
  onReady,
  className,
  children,
}: PignonMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<MapContextValue | null>(null);
  const initial = useRef({ center, zoom, pitch, bearing, interactive, onReady });

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const { center, zoom, pitch, bearing, interactive, onReady } = initial.current;

    import("maplibre-gl").then((lib) => {
      if (cancelled || !container.current) return;
      // The worker is served from /public (see scripts/copy-map-worker.mjs).
      lib.setWorkerUrl("/maplibre-gl-worker.mjs");
      map = new lib.Map({
        container: container.current,
        style: pignonMapStyle,
        center: [center.lng, center.lat],
        zoom,
        pitch,
        bearing,
        interactive,
        attributionControl: { compact: true },
        maxPitch: 72,
        maxZoom: 18,
        minZoom: 4,
      });
      map.once("load", () => {
        if (cancelled || !map) return;
        setValue({ map, lib });
        onReady?.(map);
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
      setValue(null);
    };
  }, []);

  return (
    <div className={cn("pignon-map relative isolate size-full overflow-hidden bg-[#f1f1ef]", className)}>
      {/* MapLibre's stylesheet forces `position: relative` on its container: size it, don't pin it. */}
      <div ref={container} role={label ? "region" : undefined} aria-label={label || undefined} className="size-full" />
      {value && <MapContext.Provider value={value}>{children}</MapContext.Provider>}
    </div>
  );
}

interface MapMarkerProps {
  lng: number;
  lat: number;
  /** Which point of the content sits on the coordinate */
  anchor?: PositionAnchor;
  /** Stacking order among markers */
  zIndex?: number;
  children: React.ReactNode;
}

/**
 * React content pinned to a coordinate. Must be inside <PignonMap>.
 * MapLibre moves the marker with an inline transform: animate an inner element, never the root child's position.
 */
export function MapMarker({ lng, lat, anchor = "bottom", zIndex, children }: MapMarkerProps) {
  const context = useContext(MapContext);
  const marker = useRef<Marker | null>(null);
  // Markers only render in the browser, once the map is ready: the DOM is available.
  const [element] = useState(() => document.createElement("div"));

  useEffect(() => {
    if (!context) return;
    const instance = new context.lib.Marker({ element, anchor }).setLngLat([lng, lat]).addTo(context.map);
    marker.current = instance;
    return () => {
      instance.remove();
      marker.current = null;
    };
    // Position changes are applied by the effect below, without recreating the marker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, anchor, element]);

  useEffect(() => {
    marker.current?.setLngLat([lng, lat]);
  }, [lng, lat]);

  useEffect(() => {
    marker.current?.getElement().style.setProperty("z-index", zIndex === undefined ? "" : String(zIndex));
  }, [zIndex]);

  return createPortal(children, element);
}

/** A closed ring of points `km` around a centre (true ground distance). */
export function ring(lng: number, lat: number, km: number, steps = 96): [number, number][] {
  const points: [number, number][] = [];
  const kmPerDegreeLng = 111.32 * Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    points.push([lng + (km / kmPerDegreeLng) * Math.sin(angle), lat + (km / 110.574) * Math.cos(angle)]);
  }
  return points;
}

interface MapCircleProps {
  lng: number;
  lat: number;
  radiusKm: number;
  /** Distinguishes several circles on the same map */
  id?: string;
}

/** The limit of a zone, drawn on the ground like a dimension line. Must be inside <PignonMap>; follows its props live. */
export function MapCircle({ lng, lat, radiusKm, id = "zone" }: MapCircleProps) {
  const map = useMap();
  const sourceId = `cercle-${id}`;

  useEffect(() => {
    if (!map) return;
    const data: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: ring(lng, lat, radiusKm) },
    };
    const source = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (source) {
      source.setData(data);
      return;
    }
    map.addSource(sourceId, { type: "geojson", data });
    map.addLayer(
      {
        id: `${sourceId}-trait`,
        type: "line",
        source: sourceId,
        paint: { "line-color": "#171717", "line-width": 1.2, "line-opacity": 0.45, "line-dasharray": [2, 4] },
      },
      // Under the buildings, so the line reads as drawn on the ground.
      map.getLayer("batiments") ? "batiments" : undefined,
    );
  }, [map, sourceId, lng, lat, radiusKm]);

  useEffect(() => {
    if (!map) return;
    return () => {
      try {
        if (map.getLayer(`${sourceId}-trait`)) map.removeLayer(`${sourceId}-trait`);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // The map was removed first: nothing left to clean.
      }
    };
  }, [map, sourceId]);

  return null;
}
