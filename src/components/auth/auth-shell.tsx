import Link from "next/link";
import { Logo } from "@/components/pignon/logo";
import { AuthScene } from "./auth-scene";

interface AuthShellProps {
  title: string;
  lead: React.ReactNode;
  /** Shown over the city, bottom left: what the visitor gets, or a line of the brand */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/** Sign-in and sign-up: the form on a quiet sheet, the city next to it. */
export function AuthShell({ title, lead, aside, children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:py-10">
        <Link href="/" aria-label="Pignon, accueil" className="w-fit rounded-md">
          <Logo className="text-xl" />
        </Link>
        <div className="my-auto w-full max-w-sm py-12">
          <h1 className="enseigne text-4xl">{title}</h1>
          <p className="mt-3 text-brume">{lead}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-ui text-pave">Démo : n&apos;importe quel e-mail fonctionne, rien n&apos;est enregistré en ligne.</p>
      </main>

      <div className="relative isolate overflow-hidden bg-nuit-700 max-lg:hidden">
        <AuthScene className="absolute inset-0 -z-10" />
        {aside && <div className="feuille absolute bottom-8 left-8 max-w-sm rounded-2xl p-6">{aside}</div>}
      </div>
    </div>
  );
}
