import { RadarScreen } from "@/components/radar/radar-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function RadarPage() {
  return <RadarScreen />;
}
