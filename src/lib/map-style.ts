import type { StyleSpecification } from "maplibre-gl";

/**
 * The city as an architect's white model. Free vector tiles from OpenFreeMap (OpenMapTiles schema, no key).
 * Land, streets and buildings are whites and pale greys; buildings stand up in 3D under a soft light.
 * Nothing on the base map has a colour, so that the opportunities are the only coloured volumes.
 */

const LAND = "#f1f1ef";
const WATER = "#d6e2ec";
const GREEN = "#e6eae1";
const BLOCK = "#e3e3e0";
const ROAD = "#ffffff";
const ROAD_EDGE = "#dcdcd8";
const RAIL = "#cfcfcb";
const LABEL_FAINT = "#9a9da3";
const LABEL = "#6b6f76";
const LABEL_STRONG = "#2f3237";

const width = (stops: [number, number][]) =>
  ["interpolate", ["exponential", 1.6], ["zoom"], ...stops.flat()] as unknown as number;

const name = ["coalesce", ["get", "name:fr"], ["get", "name"]] as unknown as string;

/** How the camera looks at a zone by default: tilted, slightly turned, so the volumes read. */
export const OVERVIEW = { pitch: 55, bearing: -17 };

export const pignonMapStyle = {
  version: 8,
  name: "Pignon, maquette blanche",
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  light: { anchor: "viewport", color: "#ffffff", intensity: 0.42, position: [1.3, 215, 36] },
  // The far city dissolves into white, like the edge of a model on a table.
  sky: {
    "sky-color": "#eef1f4",
    "horizon-color": "#ffffff",
    "fog-color": "#ffffff",
    "fog-ground-blend": 0.55,
    "horizon-fog-blend": 0.85,
    "sky-horizon-blend": 0.9,
    "atmosphere-blend": 0,
  },
  layers: [
    { id: "fond", type: "background", paint: { "background-color": LAND } },
    {
      id: "vegetation",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["wood", "grass", "farmland"]]],
      paint: { "fill-color": GREEN, "fill-opacity": 0.8 },
    },
    { id: "parcs", type: "fill", source: "openmaptiles", "source-layer": "park", paint: { "fill-color": GREEN } },
    { id: "eau", type: "fill", source: "openmaptiles", "source-layer": "water", paint: { "fill-color": WATER } },
    {
      id: "cours-d-eau",
      type: "line",
      source: "openmaptiles",
      "source-layer": "waterway",
      paint: { "line-color": WATER, "line-width": width([[10, 0.6], [16, 4]]) },
    },
    {
      id: "rail",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "rail"],
      minzoom: 11,
      paint: { "line-color": RAIL, "line-width": 1, "line-dasharray": [3, 3] },
    },
    {
      id: "rues-bord",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "tertiary", "secondary", "primary", "trunk", "motorway"]]],
      minzoom: 12,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROAD_EDGE, "line-width": width([[12, 1.4], [14, 4], [17, 17]]) },
    },
    {
      id: "rues",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service"]]],
      minzoom: 12,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROAD, "line-width": width([[12, 0.5], [14, 2], [17, 11]]) },
    },
    {
      id: "avenues",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["tertiary", "secondary", "primary", "trunk"]]],
      minzoom: 8,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROAD, "line-width": width([[8, 0.6], [14, 3.2], [17, 15]]) },
    },
    {
      id: "autoroutes",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "motorway"],
      minzoom: 5,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROAD, "line-width": width([[5, 0.8], [14, 4.5], [17, 17]]) },
    },
    {
      id: "ilots",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 12,
      maxzoom: 13.3,
      paint: { "fill-color": BLOCK, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.9, 0.9, 13.3, 0] },
    },
    {
      id: "batiments",
      type: "fill-extrusion",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": "#ffffff",
        // Buildings rise as the camera comes down to them.
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 12.9, 0, 13.3, ["coalesce", ["get", "render_height"], 9]],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.97,
        "fill-extrusion-vertical-gradient": true,
      },
    },
    {
      id: "noms-de-rues",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "transportation_name",
      minzoom: 15,
      layout: { "symbol-placement": "line", "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 11, "text-max-angle": 30 },
      paint: { "text-color": LABEL_FAINT, "text-halo-color": "#ffffff", "text-halo-width": 1.6 },
    },
    {
      id: "quartiers",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["suburb", "neighbourhood", "quarter"]]],
      minzoom: 12.5,
      layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 11.5 },
      paint: { "text-color": LABEL_FAINT, "text-halo-color": "#ffffff", "text-halo-width": 1.6 },
    },
    {
      id: "communes",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      filter: ["in", ["get", "class"], ["literal", ["town", "village"]]],
      minzoom: 9,
      layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 14, 13.5] },
      paint: { "text-color": LABEL, "text-halo-color": "#ffffff", "text-halo-width": 1.8 },
    },
    {
      id: "villes",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      filter: ["==", ["get", "class"], "city"],
      layout: { "text-field": name, "text-font": ["Noto Sans Bold"], "text-size": ["interpolate", ["linear"], ["zoom"], 5, 12, 12, 16] },
      paint: { "text-color": LABEL_STRONG, "text-halo-color": "#ffffff", "text-halo-width": 2 },
    },
  ],
} as unknown as StyleSpecification;

/** Ground metres covered by one CSS pixel (MapLibre uses 512 px tiles). */
export function metersPerPixel(lat: number, zoom: number): number {
  return (40_075_016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * 2 ** zoom);
}

/** [[west, south], [east, north]] of a square around a point, for `map.fitBounds`. */
export function boundsAround(lng: number, lat: number, km: number): [[number, number], [number, number]] {
  const dLat = km / 110.574;
  const dLng = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat + dLat],
  ];
}

/** A point `km` away from a centre, at a bearing (0° = north, clockwise). */
export function offset(lng: number, lat: number, km: number, bearingDeg: number): [number, number] {
  const angle = (bearingDeg * Math.PI) / 180;
  return [lng + (km * Math.sin(angle)) / (111.32 * Math.cos((lat * Math.PI) / 180)), lat + (km * Math.cos(angle)) / 110.574];
}
