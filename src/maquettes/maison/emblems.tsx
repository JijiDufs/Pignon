import type { ReactNode, SVGProps } from "react";
import type { SectorId } from "@/lib/types";

/*
 * One emblem per trade, drawn like the painted glass panels of old shopfronts:
 * a single fine line, no fill. All of them live in a 120 × 120 box.
 */

const GRAINS = [30, 40, 50, 60, 70];

function WheatEar({ angle }: { angle: number }) {
  return (
    <g transform={`rotate(${angle} 60 100)`}>
      <path d="M60 100V28" />
      <path d="M60 28c-3-4-3-10 0-14 3 4 3 10 0 14Z" />
      {GRAINS.map((y) => (
        <path key={y} d={`M60 ${y}c-5-1-8-6-7-12 4 2 7 7 7 12Zm0 0c5-1 8-6 7-12-4 2-7 7-7 12Z`} />
      ))}
      <path d="M60 14V6M57.5 17l-3.5-8M62.5 17l3.5-8" />
    </g>
  );
}

const tulip = (cx: number, cy: number) =>
  `M${cx - 9} ${cy - 8}c0 12 4 20 9 20s9-8 9-20l-4.5 6-4.5-8-4.5 8Z`;

const COMB_TEETH = Array.from({ length: 19 }, (_, i) => 24 + i * 4);

const EMBLEMS: Record<SectorId, ReactNode> = {
  bakery: (
    <>
      <WheatEar angle={-28} />
      <WheatEar angle={0} />
      <WheatEar angle={28} />
      <path d="M51 95q9 4 18 0M51 99.5q9 4 18 0" />
      <path d="M57 102l-7 12M60 102v13M63 102l7 12" />
    </>
  ),
  florist: (
    <>
      <path d={tulip(60, 24)} />
      <path d={tulip(37, 36)} />
      <path d={tulip(83, 36)} />
      <path d="M60 36v46M39 48q9 20 19 34M81 48q-9 20-19 34" />
      <path d="M57 82C42 78 32 66 32 52c11 5 21 16 25 30ZM63 82c15-4 25-16 25-30-11 5-21 16-25 30Z" />
      <path d="M53 83h14v5H53z" />
      <path d="M53 85.5c-9-7-16-3-14 3 2 5 9 3 14-3ZM67 85.5c9-7 16-3 14 3-2 5-9 3-14-3Z" />
      <path d="M57 88l-6 22M60 88v24M63 88l6 22" />
    </>
  ),
  hairdresser: (
    <>
      <circle cx="30" cy="96" r="8" />
      <circle cx="58" cy="96" r="8" />
      <path d="M35 89.5L43 60l17-45-12 47-9.5 29.5" />
      <path d="M53 89.5L45 60 28 15l12 47 9.5 29.5" />
      <circle cx="44" cy="61" r="1.6" fill="currentColor" />
      <g transform="rotate(8 87 60)">
        <rect x="78" y="18" width="18" height="84" rx="3" />
        <path d="M84 21v78" />
        <path d={COMB_TEETH.map((y) => `M84 ${y}h12`).join("")} strokeWidth="1.1" />
      </g>
    </>
  ),
  garage: (
    <>
      <path d="M24 80V64c0-7 3-11 9-13l6-15c2-5 6-8 12-8h18c6 0 10 3 12 8l6 15c6 2 9 6 9 13v16" />
      <path d="M41 50l5-12c1-3 3-4 6-4h16c3 0 5 1 6 4l5 12Z" />
      <circle cx="35" cy="64" r="6" />
      <circle cx="85" cy="64" r="6" />
      <circle cx="35" cy="64" r="2" fill="currentColor" />
      <circle cx="85" cy="64" r="2" fill="currentColor" />
      <rect x="46" y="58" width="28" height="14" rx="3" />
      <path d="M51.5 58v14M57 58v14M63 58v14M68.5 58v14" strokeWidth="1.1" />
      <rect x="18" y="80" width="84" height="7" rx="3" />
      <path d="M26 87v7h12v-7M82 87v7h12v-7" />
      <path d="M33 51l-7-3M87 51l7-3" />
    </>
  ),
  plumber: (
    <g transform="translate(-8 0)">
      <path d="M104 50H82M104 64H82" />
      <rect x="74" y="46" width="8" height="22" rx="1.5" />
      <path d="M74 49H54c-12 0-20 7-20 18v9h13v-8c0-4 3-6 7-6h20" />
      <path d="M31.5 76h18" />
      <path d="M56 49V38h10v11M58 31v-4h6v4" />
      <rect x="45" y="31" width="32" height="7" rx="3.5" />
      <path d="M40.5 84c-3 5-4.5 7-4.5 9.5a4.5 4.5 0 0 0 9 0c0-2.5-1.5-4.5-4.5-9.5Z" />
      <circle cx="40.5" cy="106" r="1.6" fill="currentColor" />
    </g>
  ),
  electrician: (
    <>
      <path d="M60 20c-17 0-29 12-29 28 0 11 6 18 12 26 3 4 4 7 4 11h26c0-4 1-7 4-11 6-8 12-15 12-26 0-16-12-28-29-28Z" />
      <path d="M48 91h24M49.5 96.5h21M52 102h16M56 106.5q4 3 8 0" />
      <path d="M54 85c0-12-3-19 1-26q2.5-5 5 0t5 0c4 7 1 14 1 26" strokeWidth="1.1" />
      <path d="M60 11V5M30 21l-4.5-4.5M90 21l4.5-4.5M21 48h-6M99 48h6" />
    </>
  ),
  restaurant: (
    <>
      <path d="M24 80c0-26 16-44 36-44s36 18 36 44Z" />
      <circle cx="60" cy="31" r="4.5" />
      <path d="M14 80h92c0 4-2 6-6 6H20c-4 0-6-2-6-6Z" />
      <path d="M35 68c2-12 10-21 21-24" strokeWidth="1.1" />
      <path d="M46 21c-3-4 3-6 0-10M60 17c-3-4 3-6 0-10M74 21c-3-4 3-6 0-10" />
      <path d="M40 94h40" strokeWidth="1.1" />
    </>
  ),
  beauty: (
    <>
      <ellipse cx="60" cy="42" rx="25" ry="29" />
      <ellipse cx="60" cy="42" rx="20" ry="24" strokeWidth="1.1" />
      <path d="M50 34l8-10M54 45l12-15" strokeWidth="1.1" />
      <path d="M52 72h16M54.5 72l1.5 30c0 5 8 5 8 0l1.5-30" />
      <path d="M98 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2ZM20 64l1.5 4.5 4.5 1.5-4.5 1.5L20 76.5 18.5 72 14 70.5l4.5-1.5Z" />
    </>
  ),
};

/** The trade's emblem. Takes the colour of the text (`currentColor`). */
export function Emblem({ sector, ...props }: { sector: SectorId } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {EMBLEMS[sector]}
    </svg>
  );
}
