import { ReglagesScreen } from "@/components/settings/reglages-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function ReglagesPage() {
  return <ReglagesScreen />;
}
