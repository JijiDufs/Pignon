"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { HEAT_HEX } from "@/components/pignon/heat";
import { MapBeacons, type Beacon } from "@/components/pignon/map-layers";
import { PignonMap, useMap } from "@/components/pignon/pignon-map";
import { CITIES, getOpportunities } from "@/lib/data";
import { cn } from "@/lib/utils";

const CITY = CITIES[0];
const VIEW = { zoom: 14.1, pitch: 62, bearing: -28 };

/** The door of the product: the demo city as a white model, its businesses without a website standing out. */
export function AuthScene({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(0);
  const beacons = useMemo<Beacon[]>(
    () =>
      [...getOpportunities(CITY.id)]
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .map((business) => ({ id: business.id, lng: business.coords.lng, lat: business.coords.lat, score: business.score, color: HEAT_HEX[business.heat] })),
    [],
  );

  useEffect(() => {
    if (reduced || !ready) return;
    const controls = animate(0, beacons.length, { duration: 2.4, ease: "easeOut", onUpdate: (value) => setShown(Math.round(value)) });
    return () => controls.stop();
  }, [beacons, reduced, ready]);

  return (
    <div className={cn("transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0", className)}>
      <PignonMap center={CITY} {...VIEW} interactive={false} label={`Carte en relief de ${CITY.name}`} onReady={() => setReady(true)}>
        <Drift />
        <MapBeacons beacons={reduced ? beacons : beacons.slice(0, shown)} animate={!reduced} />
      </PignonMap>
    </div>
  );
}

/** One slow turn of the camera on arrival. */
function Drift() {
  const map = useMap();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!map || reduced) return;
    map.easeTo({ bearing: VIEW.bearing + 30, duration: 28000, easing: (t) => 1 - Math.pow(1 - t, 2) });
  }, [map, reduced]);
  return null;
}
