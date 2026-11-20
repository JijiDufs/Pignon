import { AbonnementScreen } from "@/components/billing/abonnement-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function AbonnementPage() {
  return <AbonnementScreen />;
}
