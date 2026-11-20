import type { SiteDiagnosis, SiteStatus } from "../types";
import type { Rng } from "./prng";

/** 8.4 → "8,4" */
export function frDecimal(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function pickStatus(rng: Rng, isNew: boolean): SiteStatus {
  // A company registered a few months ago rarely has a site yet.
  if (isNew) return rng.chance(0.7) ? "none" : "social-only";
  const roll = rng.next();
  if (roll < 0.3) return "none";
  if (roll < 0.42) return "social-only";
  if (roll < 0.5) return "dead";
  if (roll < 0.57) return "insecure";
  if (roll < 0.66) return "not-mobile";
  if (roll < 0.78) return "outdated";
  return "ok";
}

/** The diagnosis of a business's web presence. `handle` is its slugified name. */
export function buildSite(rng: Rng, status: SiteStatus, handle: string): SiteDiagnosis {
  const domain = `${handle}.fr`;

  switch (status) {
    case "none":
      return {
        status,
        findings: [
          {
            label: "Aucune adresse web",
            detail: "Aucun site n'est rattaché à ce commerce, ni sur sa fiche d'annuaire ni ailleurs.",
            severity: "high",
          },
          {
            label: "Invisible hors des annuaires",
            detail: "Une recherche de son métier dans la ville ne fait ressortir que ses concurrents.",
            severity: "high",
          },
        ],
      };

    case "social-only": {
      const months = rng.int(5, 26);
      return {
        status,
        url: `facebook.com/${handle.replace(/-/g, "")}`,
        platform: "Facebook",
        https: true,
        mobileFriendly: true,
        findings: [
          {
            label: "Une page sociale pour seul site",
            detail: "Le lien « site web » de sa fiche renvoie vers une page Facebook.",
            severity: "high",
          },
          {
            label: `Dernière publication il y a ${months} mois`,
            detail: `La page n'a rien publié depuis ${months} mois : on peut croire le commerce fermé.`,
            severity: "medium",
          },
          {
            label: "Horaires et tarifs introuvables",
            detail: "Il faut faire défiler les publications pour trouver un horaire ou un prix.",
            severity: "medium",
          },
        ],
      };
    }

    case "dead":
      if (rng.chance(0.5)) {
        return {
          status,
          url: `${handle}.business.site`,
          platform: "business.site",
          https: true,
          findings: [
            {
              label: "Lien mort depuis 2024",
              detail:
                "Le site était hébergé sur business.site, un service que Google a fermé en 2024. L'adresse renvoie une erreur.",
              severity: "high",
            },
            {
              label: "Adresse toujours affichée",
              detail: "Sa fiche d'annuaire pointe encore vers ce lien : chaque clic mène à une page vide.",
              severity: "high",
            },
          ],
        };
      }
      return {
        status,
        url: domain,
        platform: "Nom de domaine expiré",
        https: false,
        findings: [
          {
            label: "Nom de domaine expiré",
            detail: "Le domaine n'a pas été renouvelé : le navigateur affiche « Ce site est inaccessible ».",
            severity: "high",
          },
          {
            label: "Adresse encore imprimée partout",
            detail: "L'adresse figure toujours sur sa fiche d'annuaire, et sans doute sur ses cartes de visite.",
            severity: "medium",
          },
        ],
      };

    case "insecure": {
      const year = rng.int(2012, 2018);
      const load = rng.int(38, 79) / 10;
      return {
        status,
        url: domain,
        platform: rng.pick(["WordPress 4.7", "Joomla 2.5", "Site fait main"]),
        copyrightYear: year,
        https: false,
        mobileFriendly: rng.chance(0.4),
        loadTimeSec: load,
        performance: rng.int(28, 55),
        findings: [
          {
            label: "Pas de HTTPS",
            detail: "Le navigateur affiche « Non sécurisé » à côté de l'adresse, avant même que la page s'ouvre.",
            severity: "high",
          },
          {
            label: `Copyright ${year}`,
            detail: `Le pied de page indique ${year} : le site n'a pas été touché depuis.`,
            severity: "medium",
          },
          {
            label: `Chargement en ${frDecimal(load)} s`,
            detail: `La page met ${frDecimal(load)} secondes à s'afficher sur un téléphone.`,
            severity: "medium",
          },
        ],
      };
    }

    case "not-mobile": {
      const year = rng.int(2011, 2017);
      const load = rng.int(45, 92) / 10;
      return {
        status,
        url: domain,
        platform: rng.pick(["WordPress 3.9", "Site fait main", "Wix (ancien éditeur)"]),
        copyrightYear: year,
        https: rng.chance(0.6),
        mobileFriendly: false,
        loadTimeSec: load,
        performance: rng.int(22, 48),
        findings: [
          {
            label: "Pas de version mobile",
            detail: "Sur un téléphone, le texte est minuscule : il faut zoomer et faire défiler de côté pour lire.",
            severity: "high",
          },
          {
            label: "Aucun bouton pour appeler",
            detail: "Le numéro est une image : impossible d'appeler en touchant l'écran.",
            severity: "medium",
          },
          {
            label: `Chargement en ${frDecimal(load)} s`,
            detail: `La page met ${frDecimal(load)} secondes à s'afficher sur un téléphone.`,
            severity: "medium",
          },
          {
            label: `Copyright ${year}`,
            detail: `Le pied de page indique ${year}.`,
            severity: "low",
          },
        ],
      };
    }

    case "outdated": {
      const directory = rng.chance(0.4);
      const year = rng.int(2011, 2018);
      const load = rng.int(34, 68) / 10;
      return {
        status,
        url: domain,
        platform: directory
          ? "Solocal (PagesJaunes)"
          : rng.pick(["WordPress 4.9", "Wix (ancien éditeur)", "Jimdo", "e-monsite"]),
        copyrightYear: year,
        https: true,
        mobileFriendly: rng.chance(0.5),
        loadTimeSec: load,
        performance: rng.int(35, 62),
        paysSubscription: directory,
        findings: [
          {
            label: `Figé depuis ${year}`,
            detail: `Le site n'a pas bougé depuis ${year} : photos, tarifs et horaires datent de cette époque.`,
            severity: "medium",
          },
          directory
            ? {
                label: "Gabarit d'annuaire",
                detail:
                  "Le site reprend un modèle d'annuaire identique à celui de centaines d'autres commerces, payé par abonnement.",
                severity: "medium",
              }
            : {
                label: "Mise en page d'une autre époque",
                detail: "Bandeau de bienvenue, boutons en relief, diaporama : le site fait son âge.",
                severity: "medium",
              },
          {
            label: `Chargement en ${frDecimal(load)} s`,
            detail: `La page met ${frDecimal(load)} secondes à s'afficher sur un téléphone.`,
            severity: "low",
          },
        ],
      };
    }

    case "ok":
      return {
        status,
        url: domain,
        platform: rng.pick(["WordPress", "Webflow", "Site sur mesure"]),
        copyrightYear: rng.pick([2025, 2026]),
        https: true,
        mobileFriendly: true,
        loadTimeSec: rng.int(14, 26) / 10,
        performance: rng.int(78, 96),
        findings: [
          {
            label: "Rien à signaler",
            detail: "Le site est récent, sécurisé et lisible sur mobile.",
            severity: "low",
          },
        ],
      };
  }
}
