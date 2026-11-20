import { CoachScreen } from "@/components/coach/coach-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function CoachPage() {
  return <CoachScreen />;
}
