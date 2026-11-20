import { cn } from "@/lib/utils";

/** The gable outline shared by the logo, business marks and map pins (24 × 24 viewBox). */
export const GABLE_PATH =
  "M10.86 2.9a1.8 1.8 0 0 1 2.28 0l7.2 5.9c.42.34.66.85.66 1.39V19.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.21c0-.54.24-1.05.66-1.39l7.2-5.9Z";

interface PignonMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Colour of the window cut in the gable */
  windowColor?: string;
}

/** The brand mark: a gable ("pignon") with one window. Colour comes from `currentColor`. */
export function PignonMark({ className, windowColor = "var(--color-nuit-950)", ...props }: PignonMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-6 shrink-0 text-lumiere", className)}
      {...props}
    >
      <path d={GABLE_PATH} />
      <rect x="9" y="11.6" width="6" height="6" rx="1.3" fill={windowColor} />
    </svg>
  );
}

/** Mark + wordmark. Size it with a font-size class on the wrapper. */
export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[0.4em] text-lg text-craie", className)}>
      <PignonMark className={cn("size-[1.25em]", markClassName)} />
      <span className="font-medium tracking-[-0.03em]">Pignon</span>
    </span>
  );
}
