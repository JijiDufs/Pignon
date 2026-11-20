import { FicheScreen } from "@/components/fiche/fiche-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function FichePage() {
  return <FicheScreen />;
}
