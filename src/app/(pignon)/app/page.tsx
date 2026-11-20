import { DashboardScreen } from "@/components/dashboard/dashboard-screen";

// Rendered in the browser only (see AppGate): nothing to validate in the prerendered shell.
export const instant = false;

export default function AujourdhuiPage() {
  return <DashboardScreen />;
}
