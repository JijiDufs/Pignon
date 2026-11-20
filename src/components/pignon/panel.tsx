import { cn } from "@/lib/utils";

const TONES = {
  /** Default grouping surface: hairline, barely lifted */
  plain: "rounded-2xl border border-trait bg-nuit-800/55",
  /** Floating above the page (popovers, sticky action bars) */
  raised: "rounded-2xl bg-nuit-800 shadow-flottant",
  /** Recessed well (code, quotes, inner lists) */
  sunken: "rounded-xl border border-trait bg-nuit-950/55",
  /** The one lit element of the screen. Use at most once per view. */
  lit: "rounded-2xl bg-nuit-800 halo",
} as const;

interface PanelProps extends React.ComponentProps<"div"> {
  tone?: keyof typeof TONES;
}

/** A surface. Prefer spacing and hairlines to boxes: reach for a Panel only when content needs a container. */
export function Panel({ tone = "plain", className, ...props }: PanelProps) {
  return <div className={cn(TONES[tone], className)} {...props} />;
}
