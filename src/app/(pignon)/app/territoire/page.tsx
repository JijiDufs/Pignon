import { TerritoireScreen } from "@/components/territoire/territoire-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function TerritoirePage() {
  return <TerritoireScreen />;
}
