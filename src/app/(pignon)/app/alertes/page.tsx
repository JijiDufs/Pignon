import { AlertesScreen } from "@/components/alertes/alertes-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function AlertesPage() {
  return <AlertesScreen />;
}
