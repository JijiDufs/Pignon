"use client";

import { useEffect, useRef, useState } from "react";
import type { DaId } from "@/lib/types";
import { cn } from "@/lib/utils";

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 780 },
} as const;

/** Address of a mockup. `embed` hides the demo banner and skips the "opened" tracking. */
export function maquetteUrl(slug: string, da: DaId, embed = false): string {
  return `/m/${slug}?da=${da}${embed ? "&embed=1" : ""}`;
}

/** Address of the "before" page: the business's current web presence, recreated. */
export function avantUrl(slug: string, embed = false): string {
  return `/m/${slug}/avant${embed ? "?embed=1" : ""}`;
}

interface MaquetteFrameProps {
  slug: string;
  /** Art direction to show (ignored when `view` is "avant") */
  da: DaId;
  /** "apres": the mockup. "avant": the current web presence. */
  view?: "apres" | "avant";
  device?: keyof typeof VIEWPORTS;
  /** Browser bar or phone bezel around the page */
  chrome?: boolean;
  /** Let the visitor scroll and click inside the mockup */
  interactive?: boolean;
  /** Text shown in the browser bar */
  address?: string;
  className?: string;
}

/**
 * A live mockup in a device frame. The page is a real route rendered in an iframe at a true
 * desktop or mobile viewport, then scaled to the width of its container.
 */
export function MaquetteFrame({
  slug,
  da,
  view = "apres",
  device = "desktop",
  chrome = true,
  interactive = true,
  address,
  className,
}: MaquetteFrameProps) {
  const viewport = VIEWPORTS[device];
  const holder = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = view === "avant" ? avantUrl(slug, true) : maquetteUrl(slug, da, true);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / viewport.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewport.width]);

  const screen = (
    <div
      ref={holder}
      className="relative w-full overflow-hidden bg-nuit-700"
      style={{ aspectRatio: `${viewport.width} / ${viewport.height}` }}
    >
      {!loaded && <div aria-hidden="true" className="absolute inset-0 animate-veille bg-nuit-600/60" />}
      {scale > 0 && (
        <iframe
          key={src}
          src={src}
          title={view === "avant" ? "Présence en ligne actuelle" : "Maquette du site"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          tabIndex={interactive ? 0 : -1}
          className={cn(
            "absolute top-0 left-0 origin-top-left border-0 transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            !interactive && "pointer-events-none",
          )}
          style={{ width: viewport.width, height: viewport.height, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );

  if (!chrome) return <div className={cn("overflow-hidden rounded-xl", className)}>{screen}</div>;

  if (device === "mobile") {
    return (
      <div className={cn("rounded-[2.2rem] bg-[#1c1c1e] p-2 shadow-[inset_0_0_0_1.5px_#3a3a3d,0_24px_48px_-20px_rgb(0_0_0/0.45)]", className)}>
        <div className="relative overflow-hidden rounded-[1.7rem]">
          {screen}
          <span aria-hidden="true" className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-[#1c1c1e]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl bg-nuit-950 shadow-flottant", className)}>
      <div className="flex h-9 items-center gap-3 px-3.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-nuit-600" />
          <i className="size-2.5 rounded-full bg-nuit-600" />
          <i className="size-2.5 rounded-full bg-nuit-600" />
        </span>
        <span className="cote min-w-0 flex-1 truncate rounded-md bg-nuit-700 px-3 py-1 text-center text-2xs text-pave">
          {address ?? `${slug}.pignon.app`}
        </span>
        <span aria-hidden="true" className="w-11" />
      </div>
      {screen}
    </div>
  );
}
