import type { Metadata } from "next";
import { AppGate } from "@/components/shell/app-shell";

export const metadata: Metadata = { title: "Ton espace" };

// The app renders in the browser only (AppGate): its pages are deliberately left out of the
// prerendered shell, so instant-navigation validation has nothing to check here.
export const instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppGate>{children}</AppGate>;
}
