"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { HEAT_HEX } from "@/components/pignon/heat";
import { MapBeacons, type Beacon } from "@/components/pignon/map-layers";
import { MapCircle, PignonMap, useMap } from "@/components/pignon/pignon-map";
import { boundsAround, OVERVIEW } from "@/lib/map-style";
import type { Business, City } from "@/lib/types";

interface OnboardingSceneProps {
  city: City;
  radiusKm: number;
  /** The businesses of the trades ticked so far */
  businesses: Business[];
  /** Last step: the camera turns slowly around the finished zone */
  orbit: boolean;
}

/** The zone being drawn: the circle follows the slider, a column rises for every business of a ticked trade. */
export function OnboardingScene({ city, radiusKm, businesses, orbit }: OnboardingSceneProps) {
  const beacons = useMemo<Beacon[]>(
    () => businesses.map((business) => ({ id: business.id, lng: business.coords.lng, lat: business.coords.lat, score: business.score, color: HEAT_HEX[business.heat] })),
    [businesses],
  );

  return (
    <PignonMap center={city} zoom={13.4} interactive={false} label="">
      <Camera city={city} radiusKm={radiusKm} orbit={orbit} />
      <MapCircle lng={city.lng} lat={city.lat} radiusKm={radiusKm} id="bienvenue" />
      <MapBeacons beacons={beacons} animate />
    </PignonMap>
  );
}

function Camera({ city, radiusKm, orbit }: { city: City; radiusKm: number; orbit: boolean }) {
  const map = useMap();
  const reduced = useReducedMotion();
  const previous = useRef<{ lng: number; lat: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    const camera = map.cameraForBounds(boundsAround(city.lng, city.lat, radiusKm * 1.1), { padding: 40 });
    const view = { center: [city.lng, city.lat] as [number, number], zoom: Math.min(camera?.zoom ?? 13.2, 14.4), pitch: OVERVIEW.pitch, bearing: OVERVIEW.bearing };
    const last = previous.current;
    previous.current = { lng: city.lng, lat: city.lat };
    if (!last) map.jumpTo(view);
    // Another city: fly there. Another radius: the same city, a little closer or further.
    else if (last.lng !== city.lng || last.lat !== city.lat) map.flyTo({ ...view, speed: 1, curve: 1.4 });
    else map.easeTo({ ...view, duration: 500 });
  }, [map, city.lng, city.lat, radiusKm]);

  useEffect(() => {
    if (!map || !orbit || reduced) return;
    map.easeTo({ bearing: OVERVIEW.bearing + 40, pitch: 60, duration: 22000, easing: (t) => 1 - Math.pow(1 - t, 2) });
  }, [map, orbit, reduced]);

  return null;
}
