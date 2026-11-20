"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { HEAT_HEX } from "@/components/pignon/heat";
import { MapBeacons, MapBeam, MapDots, type Beacon } from "@/components/pignon/map-layers";
import { MapCircle, MapMarker, PignonMap, useMap } from "@/components/pignon/pignon-map";
import { getBusinesses, getCity, getSector } from "@/lib/data";
import { takenByOthers } from "@/lib/exclusivity";
import { maskName } from "@/lib/format";
import { boundsAround, OVERVIEW } from "@/lib/map-style";
import { DEMO_CITY, useAppStore } from "@/lib/store";
import type { Business, City, SectorId } from "@/lib/types";
import { PreviewCard } from "./preview-card";
import {
  analysisLine,
  applyFilters,
  inZone,
  isOpportunity,
  NO_FILTER,
  rowId,
  sortBusinesses,
  sweepOrder,
  tally,
  type Availability,
  type Filters,
  type SortKey,
} from "./radar-data";
import { RadarPanel, type Phase } from "./radar-panel";

/** One full turn of the beam. Long enough to watch the city fill up, short enough to stay a pleasure. */
const SCAN_SECONDS = 4.2;
/** Room the floating panel takes on the left of the map, on wide screens. */
const PANEL_WIDTH = 416;

/** The radar: the city as a white model, the opportunities rising in colour, the camera diving on the one you pick. */
export function RadarScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  const zone = useAppStore((state) => state.zone);
  const setZone = useAppStore((state) => state.setZone);
  const markScanned = useAppStore((state) => state.markScanned);
  const reservations = useAppStore((state) => state.reservations);
  const plan = useAppStore((state) => state.plan);
  const unlocked = useAppStore((state) => state.unlocked);

  const [phase, setPhase] = useState<Phase>(() => (useAppStore.getState().lastScanAt ? "done" : "idle"));
  const [revealed, setRevealed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(NO_FILTER);
  const [sort, setSort] = useState<SortKey>("score");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const angle = useMotionValue(0);
  const sweep = useRef<AnimationPlaybackControls | null>(null);

  const city = getCity(zone.cityId) ?? getCity(DEMO_CITY)!;
  const swept = useMemo(
    () => sweepOrder(inZone(getBusinesses(city.id), zone)),
    // The zone object changes identity on every store write: depend on what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [city.id, zone.radiusKm, zone.sectors],
  );

  const visible = useMemo(
    () => (phase === "done" ? swept : phase === "scanning" ? swept.slice(0, revealed) : []),
    [phase, swept, revealed],
  );
  const opportunities = useMemo(() => visible.filter(isOpportunity), [visible]);
  const stats = tally(visible);
  const list = useMemo(
    () => (phase === "done" ? sortBusinesses(applyFilters(opportunities, filters), sort) : [...opportunities].reverse()),
    [phase, opportunities, filters, sort],
  );
  const selected = selectedId ? list.find((business) => business.id === selectedId) : undefined;

  const availabilityOf = useCallback(
    (businessId: string): Availability =>
      takenByOthers(businessId) ? "taken" : reservations[businessId] ? "mine" : "free",
    [reservations],
  );

  const beacons = useMemo<Beacon[]>(
    () =>
      list.map((business) => {
        const taken = takenByOthers(business.id) !== null;
        return {
          id: business.id,
          lng: business.coords.lng,
          lat: business.coords.lat,
          score: taken ? 18 : business.score,
          color: taken ? HEAT_HEX.cold : HEAT_HEX[business.heat],
        };
      }),
    [list],
  );
  const seen = useMemo(() => visible.filter((business) => !isOpportunity(business)).map((business) => business.coords), [visible]);

  const latest = visible[visible.length - 1];
  const latestMasked = latest ? plan === "free" && !unlocked.includes(latest.id) : false;
  const liveLine = latest ? `Analyse : ${analysisLine(latest, latestMasked, getSector(latest.sector).label)}` : "Le radar démarre";

  const finish = useCallback(() => {
    setPhase("done");
    markScanned();
  }, [markScanned]);

  const startScan = useCallback(() => {
    sweep.current?.stop();
    setSelectedId(null);
    setFilters(NO_FILTER);
    setControlsOpen(false);
    if (reducedMotion) {
      finish();
      return;
    }
    angle.set(0);
    setRevealed(0);
    setPhase("scanning");
    sweep.current = animate(angle, 360, { duration: SCAN_SECONDS, ease: "linear", onComplete: finish });
  }, [angle, finish, reducedMotion]);

  // The beam raises every business whose bearing it has passed.
  useMotionValueEvent(angle, "change", (degrees) => {
    if (phase !== "scanning") return;
    setRevealed((count) => {
      let next = count;
      while (next < swept.length && swept[next].bearing <= degrees) next++;
      return next;
    });
  });

  useEffect(() => () => sweep.current?.stop(), []);

  // /app/radar?scan=1 (first launch, command palette) starts a scan as soon as the map is there.
  const autoScan = searchParams.get("scan") === "1";
  useEffect(() => {
    if (!autoScan || !mapReady) return;
    // Deferred to the next frame: the scan is an event that follows the map, not a state to mirror.
    const frame = requestAnimationFrame(() => {
      router.replace("/app/radar");
      startScan();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoScan, mapReady, router, startScan]);

  const select = useCallback((businessId: string) => {
    setSelectedId(businessId);
    document.getElementById(rowId(businessId))?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  const changeCity = (cityId: string) => {
    sweep.current?.stop();
    setZone({ cityId });
    setSelectedId(null);
    setFilters(NO_FILTER);
    // Another city has not been scanned yet.
    setPhase("idle");
  };

  const selectedName = selected && (plan === "free" && !unlocked.includes(selected.id) ? maskName(selected.name) : selected.name);

  return (
    <div className="relative flex h-full flex-col-reverse lg:block">
      <RadarPanel
        city={city}
        zone={zone}
        phase={phase}
        stats={stats}
        list={list}
        liveLine={liveLine}
        filters={filters}
        sort={sort}
        selectedId={selectedId}
        hoveredId={null}
        controlsOpen={controlsOpen}
        availabilityOf={availabilityOf}
        onToggleControls={() => setControlsOpen((open) => !open)}
        onCity={changeCity}
        onRadius={(radiusKm) => setZone({ radiusKm })}
        onSectors={(sectors: SectorId[]) => setZone({ sectors })}
        onScan={startScan}
        onFilters={setFilters}
        onSort={setSort}
        onSelect={select}
        onHover={() => {}}
      />

      <div className="relative h-[48dvh] shrink-0 lg:absolute lg:inset-0 lg:h-auto">
        <PignonMap center={city} zoom={13} label={`Carte en relief de ${city.name}`} onReady={() => setMapReady(true)}>
          <Camera city={city} radiusKm={zone.radiusKm} selected={selected} scanning={phase === "scanning"} />
          <MapCircle lng={city.lng} lat={city.lat} radiusKm={zone.radiusKm} />
          <MapBeam lng={city.lng} lat={city.lat} radiusKm={zone.radiusKm} angle={angle} active={phase === "scanning"} />
          <MapDots points={seen} />
          <MapBeacons beacons={beacons} selectedId={selected?.id} animate={phase === "scanning"} onSelect={select} />
          {selected && (
            <MapMarker lng={selected.coords.lng} lat={selected.coords.lat} anchor="top" zIndex={5}>
              <span className="mt-2 block rounded-md bg-craie px-2 py-1 text-ui font-medium whitespace-nowrap text-nuit-950 shadow-flottant">
                {selectedName}
              </span>
            </MapMarker>
          )}
        </PignonMap>

        {selected && (
          <PreviewCard
            business={selected}
            availability={availabilityOf(selected.id)}
            onClose={() => setSelectedId(null)}
            className="absolute inset-x-3 bottom-3 z-10 lg:right-5 lg:bottom-5 lg:left-auto lg:w-[400px]"
          />
        )}
      </div>
    </div>
  );
}

interface CameraProps {
  city: City;
  radiusKm: number;
  selected?: Business;
  scanning: boolean;
}

/**
 * The camera work. Overview: the whole zone, tilted. A business is picked: the camera dives to it and
 * turns around it. A scan runs: the camera drifts around the city while the columns rise.
 */
function Camera({ city, radiusKm, selected, scanning }: CameraProps) {
  const map = useMap();
  const first = useRef(true);
  const lng = selected?.coords.lng;
  const lat = selected?.coords.lat;

  useEffect(() => {
    if (!map) return;
    // Keep the subject clear of the floating panel on wide screens.
    const left = map.getContainer().clientWidth >= 900 ? PANEL_WIDTH : 24;
    const padding = { top: 32, bottom: 32, right: 32, left };

    if (lng !== undefined && lat !== undefined) {
      map.flyTo({
        center: [lng, lat],
        zoom: 16.3,
        pitch: 63,
        bearing: map.getBearing() + 32,
        padding,
        speed: 0.75,
        curve: 1.5,
      });
      return;
    }
    const camera = map.cameraForBounds(boundsAround(city.lng, city.lat, radiusKm * 0.78), { padding });
    map.easeTo({
      center: [city.lng, city.lat],
      // Never so far that the buildings lie flat: the city has to stay a model.
      zoom: Math.max(camera?.zoom ?? 13.4, 13.35),
      pitch: OVERVIEW.pitch,
      bearing: OVERVIEW.bearing,
      padding,
      duration: first.current ? 0 : 1700,
    });
    first.current = false;
  }, [map, city.lng, city.lat, radiusKm, lng, lat]);

  useEffect(() => {
    if (!map || !scanning) return;
    map.easeTo({ bearing: map.getBearing() + 38, duration: SCAN_SECONDS * 1000, easing: (t) => t });
  }, [map, scanning]);

  return null;
}
