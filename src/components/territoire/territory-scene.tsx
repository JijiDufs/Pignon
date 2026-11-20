"use client";

import { useEffect, useMemo, useRef } from "react";
import { HEAT_HEX } from "@/components/pignon/heat";
import { MapBeacons, type Beacon } from "@/components/pignon/map-layers";
import { MapCircle, PignonMap, useMap } from "@/components/pignon/pignon-map";
import { OVERVIEW } from "@/lib/map-style";
import type { Business, City } from "@/lib/types";

interface TerritorySceneProps {
  city: City;
  /** The businesses of the trade in this city */
  businesses: Business[];
  /** Held by the account: the columns take their colour */
  mine: boolean;
}

const VIEW = { zoom: 12.2, pitch: 50, bearing: OVERVIEW.bearing };
const UNCLAIMED = "#b4b7bd";

/** A territory on the map: every business of one trade in one city. Grey while it is free, lit once it is yours. */
export function TerritoryScene({ city, businesses, mine }: TerritorySceneProps) {
  // The id changes with the state, so taking the territory makes every column rise again, in colour.
  const beacons = useMemo<Beacon[]>(
    () =>
      businesses.map((business) => ({
        id: `${business.id}:${mine ? "mine" : "free"}`,
        lng: business.coords.lng,
        lat: business.coords.lat,
        score: business.score,
        color: mine ? HEAT_HEX[business.heat] : UNCLAIMED,
      })),
    [businesses, mine],
  );

  return (
    <PignonMap center={city} {...VIEW} interactive={false} label="">
      <Camera city={city} />
      <MapCircle lng={city.lng} lat={city.lat} radiusKm={4} id="territoire" />
      <MapBeacons beacons={beacons} animate />
    </PignonMap>
  );
}

function Camera({ city }: { city: City }) {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (!map) return;
    if (first.current) {
      first.current = false;
      return;
    }
    map.flyTo({ center: [city.lng, city.lat], ...VIEW, speed: 1.1, curve: 1.3 });
  }, [map, city.lng, city.lat]);

  return null;
}
