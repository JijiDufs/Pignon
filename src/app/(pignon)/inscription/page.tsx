import { Suspense } from "react";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/forms";
import { getPlan } from "@/lib/plans";

export const metadata: Metadata = { title: "Créer un compte Pignon" };

export default function InscriptionPage() {
  const free = getPlan("free");

  return (
    <AuthShell
      title="Essaie Pignon gratuitement"
      lead="Un compte Découverte, sans carte bancaire et sans limite de durée."
      aside={
        <>
          <p className="titre text-xl">Ce que tu obtiens tout de suite</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {free.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2.5">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-pave" />
                {highlight}
              </li>
            ))}
          </ul>
        </>
      }
    >
      {/* The form reads ?formule= from the address: it renders in the browser. */}
      <Suspense fallback={<div className="h-[420px]" />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
