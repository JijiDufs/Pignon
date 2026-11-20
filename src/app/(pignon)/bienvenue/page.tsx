import { Suspense } from "react";
import type { Metadata } from "next";
import { Frame, Onboarding } from "@/components/onboarding/onboarding";

export const metadata: Metadata = { title: "Bienvenue sur Pignon" };

export default function BienvenuePage() {
  return (
    // The wizard reads ?formule= and the saved zone: it renders in the browser, inside the same frame.
    <Suspense fallback={<Frame step={0} />}>
      <Onboarding />
    </Suspense>
  );
}
