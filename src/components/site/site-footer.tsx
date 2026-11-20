import Link from "next/link";
import { Logo } from "@/components/pignon/logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/#fonctionnement", label: "Fonctionnement" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/app", label: "Voir la démo" },
      { href: "/m", label: "Galerie des maquettes" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/inscription", label: "Créer un compte" },
      { href: "/connexion", label: "Se connecter" },
    ],
  },
];

/** Footer of the public pages. */
export function SiteFooter() {
  return (
    <footer className="border-t border-trait bg-nuit-950">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Logo className="text-xl" />
          <p className="mt-4 max-w-[38ch] text-sm text-brume">
            Pignon repère les commerces sans site de ta ville, prépare leur maquette et t&apos;aide à décrocher le rendez-vous.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-sm font-semibold">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-brume">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="rounded transition-colors hover:text-craie">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-trait">
        <p className="mx-auto max-w-[1240px] px-4 py-5 text-ui text-pave sm:px-6 lg:px-10">
          Version de démonstration. Les commerces, les avis et les chiffres affichés sont inventés.
        </p>
      </div>
    </footer>
  );
}
