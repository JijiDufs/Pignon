import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Se connecter à Pignon" };

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Content de te revoir"
      lead="Ta zone, ton pipeline et tes alertes t'attendent."
      aside={
        <>
          <p className="titre text-xl">Lille, ce matin</p>
          <p className="mt-1.5 text-sm text-brume">Chaque colonne est un commerce sans site digne de ce nom. Les plus hautes sont celles à appeler en premier.</p>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
