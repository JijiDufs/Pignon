// MapLibre 6 loads its rendering engine from a separate worker file that the bundler cannot locate:
// serve it from /public, and keep it in sync with the installed version (runs after every install).
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre-gl-worker.mjs");
