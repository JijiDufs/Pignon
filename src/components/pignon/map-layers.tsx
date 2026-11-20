"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import type { ExpressionSpecification, GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import { offset } from "@/lib/map-style";
import { ring, useMap } from "./pignon-map";

/** Layers drawn inside the 3D scene itself (they tilt and scale with the camera). Use inside <PignonMap>. */

const empty: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function removeAll(map: MapLibreMap, layers: string[], source: string) {
  try {
    for (const layer of layers) if (map.getLayer(layer)) map.removeLayer(layer);
    if (map.getSource(source)) map.removeSource(source);
  } catch {
    // The map was removed first: nothing left to clean.
  }
}

export interface Beacon {
  id: string;
  lng: number;
  lat: number;
  /** 0–100: the height of the column */
  score: number;
  /** Hex colour (the canvas cannot read CSS variables) */
  color: string;
}

interface MapBeaconsProps {
  beacons: Beacon[];
  selectedId?: string | null;
  /** New beacons rise from the ground instead of appearing at full height */
  animate?: boolean;
  onSelect?: (id: string) => void;
}

const BEACONS = "balises";
const RISE_MS = 900;
/** Footprint of a column, in km: wide enough to read from above, slim enough to stay a marker. */
const FOOTPRINT_KM = 0.017;

/**
 * The opportunities as coloured columns standing among the white buildings: the taller, the better the score.
 * They are the one coloured thing on the map. Pointer only: the list next to the map is the keyboard path.
 */
export function MapBeacons({ beacons, selectedId, animate = false, onSelect }: MapBeaconsProps) {
  const map = useMap();
  /** id → time its rise started, or -1 once it stands at full height */
  const rising = useRef(new Map<string, number>());
  const frame = useRef(0);
  const select = useRef(onSelect);
  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!map) return;
    map.addSource(BEACONS, { type: "geojson", data: empty, promoteId: "bid" });
    const grown: ExpressionSpecification = ["coalesce", ["feature-state", "k"], 0];
    map.addLayer({
      id: BEACONS,
      type: "fill-extrusion",
      source: BEACONS,
      paint: {
        "fill-extrusion-color": ["case", ["boolean", ["feature-state", "sel"], false], "#171717", ["get", "c"]],
        // Seen from far the columns are stretched so they still stand out; up close they are true to scale.
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12,
          ["*", ["*", ["get", "h"], 5], grown],
          16.5,
          ["*", ["get", "h"], grown],
        ],
        "fill-extrusion-opacity": 1,
        // No ground shading: the columns must stay the one clean colour of the scene.
        "fill-extrusion-vertical-gradient": false,
      },
    });

    const onClick = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.bid;
      if (typeof id === "string") select.current?.(id);
    };
    const canvas = map.getCanvas();
    const onEnter = () => (canvas.style.cursor = "pointer");
    const onLeave = () => (canvas.style.cursor = "");
    map.on("click", BEACONS, onClick);
    map.on("mouseenter", BEACONS, onEnter);
    map.on("mouseleave", BEACONS, onLeave);
    const states = rising.current;

    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      states.clear();
      map.off("click", BEACONS, onClick);
      map.off("mouseenter", BEACONS, onEnter);
      map.off("mouseleave", BEACONS, onLeave);
      removeAll(map, [BEACONS], BEACONS);
    };
  }, [map]);

  useEffect(() => {
    const source = map?.getSource(BEACONS) as GeoJSONSource | undefined;
    if (!map || !source) return;

    source.setData({
      type: "FeatureCollection",
      features: beacons.map((beacon) => ({
        type: "Feature",
        properties: { bid: beacon.id, h: 14 + beacon.score * 0.6, c: beacon.color },
        geometry: { type: "Polygon", coordinates: [ring(beacon.lng, beacon.lat, FOOTPRINT_KM, 6)] },
      })),
    });

    const states = rising.current;
    const present = new Set(beacons.map((beacon) => beacon.id));
    for (const id of [...states.keys()]) {
      if (present.has(id)) continue;
      states.delete(id);
      map.removeFeatureState({ source: BEACONS, id });
    }
    const now = performance.now();
    for (const id of present) {
      if (states.has(id)) continue;
      states.set(id, animate ? now : -1);
      map.setFeatureState({ source: BEACONS, id }, { k: animate ? 0 : 1 });
    }

    const tick = () => {
      let running = false;
      const time = performance.now();
      for (const [id, start] of states) {
        if (start < 0) continue;
        const progress = Math.min(1, (time - start) / RISE_MS);
        map.setFeatureState({ source: BEACONS, id }, { k: easeOut(progress) });
        if (progress >= 1) states.set(id, -1);
        else running = true;
      }
      frame.current = running ? requestAnimationFrame(tick) : 0;
    };
    if (animate && frame.current === 0) frame.current = requestAnimationFrame(tick);
  }, [map, beacons, animate]);

  useEffect(() => {
    if (!map || !selectedId || !map.getSource(BEACONS)) return;
    map.setFeatureState({ source: BEACONS, id: selectedId }, { sel: true });
    return () => {
      if (map.getSource(BEACONS)) map.setFeatureState({ source: BEACONS, id: selectedId }, { sel: false });
    };
  }, [map, selectedId]);

  return null;
}

const DOTS = "points-vus";

/** Businesses the scan looked at and left aside (their site is fine): small grey dots on the ground. */
export function MapDots({ points }: { points: { lng: number; lat: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.addSource(DOTS, { type: "geojson", data: empty });
    map.addLayer({
      id: DOTS,
      type: "circle",
      source: DOTS,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 2, 16, 5],
        "circle-color": "#a3a6ab",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
        "circle-pitch-alignment": "map",
      },
    });
    return () => removeAll(map, [DOTS], DOTS);
  }, [map]);

  useEffect(() => {
    const source = map?.getSource(DOTS) as GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [point.lng, point.lat] },
      })),
    });
  }, [map, points]);

  return null;
}

const BEAM = "faisceau";
/** Width of the lit sector behind the leading edge, in degrees, and how many slices fade it out. */
const SPAN = 54;
const SLICES = 6;

interface MapBeamProps {
  lng: number;
  lat: number;
  radiusKm: number;
  /** 0 to 360°, clockwise from north: driven by the scan */
  angle: MotionValue<number>;
  active: boolean;
}

/** The radar beam, as light sweeping the ground of the city: buildings and columns stand in it. */
export function MapBeam({ lng, lat, radiusKm, angle, active }: MapBeamProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.addSource(BEAM, { type: "geojson", data: empty });
    const under = map.getLayer("batiments") ? "batiments" : undefined;
    map.addLayer(
      {
        id: BEAM,
        type: "fill",
        source: BEAM,
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: { "fill-color": "#d9391a", "fill-opacity": ["get", "o"] },
      },
      under,
    );
    map.addLayer(
      {
        id: `${BEAM}-bord`,
        type: "line",
        source: BEAM,
        filter: ["==", ["geometry-type"], "LineString"],
        paint: { "line-color": "#d9391a", "line-width": 2, "line-opacity": 0.9 },
      },
      under,
    );
    return () => removeAll(map, [BEAM, `${BEAM}-bord`], BEAM);
  }, [map]);

  useEffect(() => {
    const source = map?.getSource(BEAM) as GeoJSONSource | undefined;
    if (!source) return;
    if (!active) {
      source.setData(empty);
      return;
    }
    const centre: [number, number] = [lng, lat];
    const draw = (degrees: number) => {
      const features: GeoJSON.Feature[] = [];
      for (let slice = 0; slice < SLICES; slice++) {
        const from = degrees - SPAN + (slice * SPAN) / SLICES;
        const to = from + SPAN / SLICES;
        const arc = [0, 0.5, 1].map((t) => offset(lng, lat, radiusKm, from + (to - from) * t));
        features.push({
          type: "Feature",
          properties: { o: 0.02 + 0.16 * Math.pow((slice + 1) / SLICES, 2) },
          geometry: { type: "Polygon", coordinates: [[centre, ...arc, centre]] },
        });
      }
      features.push({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [centre, offset(lng, lat, radiusKm, degrees)] },
      });
      source.setData({ type: "FeatureCollection", features });
    };
    draw(angle.get());
    return angle.on("change", draw);
  }, [map, lng, lat, radiusKm, angle, active]);

  return null;
}
