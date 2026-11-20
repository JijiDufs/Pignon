import Link from "next/link";
import { Logo } from "@/components/pignon/logo";
import { LinkButton } from "@/components/pignon/link-button";
import { SITE_LINKS } from "./site-links";
import { SiteMobileMenu } from "./site-mobile-menu";

/** Header of the public pages (accueil, tarifs). Sticky, quiet, one bright button. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-trait bg-nuit-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-8 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Pignon, accueil" className="rounded-md">
          <Logo className="text-xl" />
        </Link>
        <nav aria-label="Navigation du site" className="hidden items-center gap-1 md:flex">
          {SITE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brume transition-colors hover:text-craie"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LinkButton href="/connexion" variant="ghost" className="text-brume">
            Se connecter
          </LinkButton>
          <LinkButton href="/inscription">Essayer gratuitement</LinkButton>
        </div>
        <div className="ml-auto md:hidden">
          <SiteMobileMenu />
        </div>
      </div>
    </header>
  );
}
