"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { HEAT_HEX } from "@/components/pignon/heat";
import { MapBeacons, type Beacon } from "@/components/pignon/map-layers";
import { MapMarker, PignonMap, useMap } from "@/components/pignon/pignon-map";
import { OVERVIEW } from "@/lib/map-style";
import type { Business, City } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SceneProps {
  city: City;
  /** The businesses of the queue, as columns */
  businesses: Business[];
  /** The one to call now: the camera stands in front of it */
  focus?: Business;
  className?: string;
}

const CLOSE = { zoom: 15.6, pitch: 64, bearing: OVERVIEW.bearing + 24 };
const WIDE = { zoom: 13.1, pitch: OVERVIEW.pitch, bearing: OVERVIEW.bearing };

/** The city behind the day's first call: the camera flies to whoever is on top of the queue. */
export function Scene({ city, businesses, focus, className }: SceneProps) {
  const [ready, setReady] = useState(false);
  const beacons = useMemo<Beacon[]>(
    () =>
      businesses.map((business) => ({
        id: business.id,
        lng: business.coords.lng,
        lat: business.coords.lat,
        score: business.score,
        color: HEAT_HEX[business.heat],
      })),
    [businesses],
  );
  const start = focus ? { ...focus.coords, ...CLOSE } : { lng: city.lng, lat: city.lat, ...WIDE };

  return (
    <div className={cn("transition-opacity duration-700", ready ? "opacity-100" : "opacity-0", className)}>
      <PignonMap center={start} zoom={start.zoom} pitch={start.pitch} bearing={start.bearing} interactive={false} label={`Carte en relief de ${city.name}`} onReady={() => setReady(true)}>
        <Camera city={city} focus={focus} />
        <MapBeacons beacons={beacons} selectedId={focus?.id} animate />
        {focus && (
          <MapMarker lng={focus.coords.lng} lat={focus.coords.lat} anchor="top" zIndex={5}>
            <span className="mt-2 block rounded-md bg-craie px-2 py-1 text-ui font-medium whitespace-nowrap text-nuit-950 shadow-flottant">
              {focus.name}
            </span>
          </MapMarker>
        )}
      </PignonMap>
    </div>
  );
}

function Camera({ city, focus }: { city: City; focus?: Business }) {
  const map = useMap();
  const reduced = useReducedMotion();
  const first = useRef(true);
  const lng = focus?.coords.lng ?? city.lng;
  const lat = focus?.coords.lat ?? city.lat;
  const close = Boolean(focus);

  useEffect(() => {
    if (!map) return;
    const width = map.getContainer().clientWidth;
    // The sheet with the day's first call covers the left of the scene on a wide screen.
    const padding = { top: 0, bottom: 0, right: 0, left: width >= 900 ? Math.min(460, width * 0.42) : 0 };
    const view = close ? CLOSE : WIDE;
    if (first.current) {
      first.current = false;
      map.jumpTo({ center: [lng, lat], padding });
      if (!reduced) map.easeTo({ bearing: view.bearing + 22, duration: 26000, easing: (t) => 1 - Math.pow(1 - t, 2) });
      return;
    }
    map.flyTo({ center: [lng, lat], ...view, padding, speed: 0.8, curve: 1.3, essential: false });
  }, [map, lng, lat, close, reduced]);

  return null;
}
