"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { AnimatedNumber } from "@/components/pignon/animated-number";
import { HEAT_HEX } from "@/components/pignon/heat";
import { LinkButton } from "@/components/pignon/link-button";
import { MapBeacons, type Beacon } from "@/components/pignon/map-layers";
import { PignonMap, useMap } from "@/components/pignon/pignon-map";
import { CITIES, getCity, getOpportunities, getZoneStats } from "@/lib/data";
import { formatEuro } from "@/lib/format";
import type { City } from "@/lib/types";
import { cn } from "@/lib/utils";

const START_CITY = "lille";
const RISE_SECONDS = 2.6;
const VIEW = { zoom: 13.3, pitch: 58, bearing: -22 };

/** The opening scene: the city as a white model, and the businesses without a website rising out of it. */
export function Hero() {
  const reduced = useReducedMotion();
  const selectId = useId();
  const [cityId, setCityId] = useState(START_CITY);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(0);
  const city = getCity(cityId) ?? CITIES[0];
  const stats = useMemo(() => getZoneStats(cityId), [cityId]);

  // Nearest to the centre first: the columns spread outward like a wave.
  const beacons = useMemo<Beacon[]>(
    () =>
      [...getOpportunities(cityId)]
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .map((business) => ({
          id: business.id,
          lng: business.coords.lng,
          lat: business.coords.lat,
          score: business.score,
          color: HEAT_HEX[business.heat],
        })),
    [cityId],
  );

  useEffect(() => {
    if (reduced || !ready) return;
    const controls = animate(0, beacons.length, {
      duration: RISE_SECONDS,
      ease: "easeOut",
      onUpdate: (value) => setShown(Math.round(value)),
    });
    return () => controls.stop();
  }, [beacons, reduced, ready]);

  const visible = reduced ? beacons : beacons.slice(0, shown);

  return (
    <section className="relative isolate overflow-hidden border-b border-trait">
      {/* The map fades in once its camera is placed, so the city never jumps into position. */}
      <div className={cn("absolute inset-0 -z-10 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
        <PignonMap center={city} {...VIEW} interactive={false} label={`Carte en relief de ${city.name}`} onReady={() => setReady(true)}>
          <HeroCamera city={city} />
          <MapBeacons beacons={visible} animate={!reduced} />
        </PignonMap>
        {/* The calm side: the headline sits on white, the city shows through on the right. */}
        <div className="absolute inset-0 bg-linear-to-r from-nuit-900 from-25% via-nuit-900/80 via-45% to-transparent to-70% max-lg:bg-nuit-900/80 max-lg:bg-none" />
              </div>

      <div className="relative mx-auto flex min-h-[min(780px,calc(100svh-4rem))] max-w-[1240px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <h1 className="enseigne max-w-[17ch] text-[clamp(2.5rem,5.6vw,4.5rem)]">Trouve les commerces sans site. Arrive avec leur maquette.</h1>
        <p className="mt-6 max-w-[46ch] text-lg text-brume">
          Pignon scanne ta ville, classe les commerces qui valent un appel, prépare le site que tu vas leur montrer et t&apos;écrit quoi
          dire au téléphone.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <LinkButton href="/inscription" size="xl">
            Essayer gratuitement
          </LinkButton>
          <LinkButton href="/app" size="xl" variant="outline" className="bg-nuit-800">
            Voir la démo
          </LinkButton>
        </div>

        {/* A floating sheet on the map, like the panels of the application. */}
        <div className="feuille mt-12 w-full max-w-sm rounded-2xl p-5 lg:absolute lg:right-10 lg:bottom-14 lg:mt-0 lg:w-[340px]">
          <label htmlFor={selectId} className="text-ui text-brume">
            Ta ville
          </label>
          <select
            id={selectId}
            value={cityId}
            onChange={(event) => {
              setShown(0);
              setCityId(event.target.value);
            }}
            className="mt-1.5 block h-10 w-full rounded-lg border border-trait-fort bg-nuit-800 px-3 text-sm font-medium outline-none focus-visible:border-craie focus-visible:ring-3 focus-visible:ring-craie/15"
          >
            {CITIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p aria-live="polite" className="mt-5 flex items-center gap-4">
            <AnimatedNumber value={stats.opportunities} className="cote text-6xl font-medium tracking-tight text-lumiere" />
            <span className="text-sm text-brume">
              commerces sans site digne de ce nom, soit{" "}
              <AnimatedNumber value={stats.potentialRevenue} format={formatEuro} className="font-medium text-craie" /> de sites à vendre
            </span>
          </p>
          <p className="cote mt-4 border-t border-trait pt-3 text-2xs text-pave">
            {stats.scanned} commerces analysés, données de démonstration
          </p>
        </div>

      </div>
    </section>
  );
}

/** Places the city in the free part of the scene, drifts once on arrival, then flies to each city that is picked. */
function HeroCamera({ city }: { city: City }) {
  const map = useMap();
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (!map) return;
    const width = map.getContainer().clientWidth;
    // The headline takes the left of the scene on a wide screen.
    const padding = { top: 0, bottom: 0, right: 0, left: width >= 1024 ? width * 0.4 : 0 };
    if (first.current) {
      first.current = false;
      map.jumpTo({ center: [city.lng, city.lat], padding });
      if (!reduced) map.easeTo({ bearing: VIEW.bearing + 26, duration: 24000, easing: (t) => 1 - Math.pow(1 - t, 2) });
      return;
    }
    map.flyTo({ center: [city.lng, city.lat], ...VIEW, padding, speed: 0.9, curve: 1.4 });
  }, [map, city.lng, city.lat, reduced]);

  return null;
}
