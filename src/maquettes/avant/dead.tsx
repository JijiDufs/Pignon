import type { ReactNode } from "react";
import { CloudOff, FileX } from "lucide-react";
import { Browser } from "./browser";
import { hostOf, type AvantProps } from "./lib";

/**
 * Dead link: either the free site builder that hosted the page closed in 2024, or the domain was never
 * renewed and the browser finds nothing at that address.
 */
export function Dead({ business }: AvantProps) {
  const host = hostOf(business);

  if (/business\.site/i.test(`${business.site.platform} ${host}`)) {
    return (
      <Browser host={host} secure>
        <ErrorPage icon={<FileX />} title="Cette page n'existe plus" code="Erreur 404">
          <p>
            Le service qui hébergeait <b className="break-all">{host}</b> a fermé en 2024. Les sites qu&apos;il proposait
            ne sont plus en ligne.
          </p>
        </ErrorPage>
      </Browser>
    );
  }

  return (
    <Browser host={host}>
      <ErrorPage icon={<CloudOff />} title="Ce site est inaccessible" code="ERR_NAME_NOT_RESOLVED" retry>
        <p>
          Impossible de trouver le serveur de <b className="break-all">{host}</b>.
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-6">
          <li>Vérifiez que l&apos;adresse ne contient pas d&apos;erreur.</li>
          <li>Le nom de domaine a peut-être expiré.</li>
        </ul>
      </ErrorPage>
    </Browser>
  );
}

interface ErrorPageProps {
  icon: ReactNode;
  title: string;
  code: string;
  retry?: boolean;
  children: ReactNode;
}

// Kept left of centre: in the before/after slider, the left half of the page is what shows first.
function ErrorPage({ icon, title, code, retry = false, children }: ErrorPageProps) {
  return (
    <main className="min-h-full bg-white px-6 pt-14 pb-10 sm:pt-[88px] sm:pl-[136px]">
      <div className="max-w-[600px]">
        <span aria-hidden="true" className="block text-[#9aa0a6] [&>svg]:size-[72px] [&>svg]:stroke-[1.2] sm:[&>svg]:size-[88px]">
          {icon}
        </span>
        <h1 className="mt-7 text-[30px] leading-tight font-bold sm:text-[40px]">{title}</h1>
        <div className="mt-4 text-[17px] leading-relaxed text-[#4d5156] sm:text-[19px]">{children}</div>
        <p className="mt-6 text-[13px] tracking-wide text-[#80868b] sm:text-[14px]">{code}</p>
        {retry && (
          <span className="mt-8 inline-flex h-11 items-center rounded-full bg-[#1a56c4] px-7 text-[15px] font-bold text-white">
            Réessayer
          </span>
        )}
      </div>
    </main>
  );
}
