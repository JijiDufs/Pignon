import type { Business, DaId } from "../types";
import { getMaquetteContent } from "./content";
import { getDa, getSector } from "./reference";
import { frDecimal } from "./site";

const LAYOUT: Record<DaId, string> = {
  atelier:
    "Titres en capitales condensées très grasses, grands chiffres pour les prix, filets épais, hachures de chantier en séparateurs. Fond charbon, texte acier, l'orange réservé aux boutons et aux prix.",
  maison:
    "Titres en sérif généreux, compositions centrées façon carte ou ardoise, petits ornements dessinés entre les sections. Fond lin, texte sapin, le jaune beurre en touches.",
  clair:
    "Grille stricte, beaucoup de blanc, blocs d'information très lisibles (téléphone, horaires, tarifs) dès le premier écran. Un seul accent lagon pour les actions.",
  neon:
    "Titres très larges et massifs, bandeau de texte qui défile, contrastes francs. Fond minuit, rose néon pour les titres et les boutons, citron en ponctuation.",
};

/** A complete French prompt to paste into an AI site builder (Lovable, v0, Claude…). */
export function buildPrompt(business: Business, daId: DaId): string {
  const da = getDa(daId);
  const sector = getSector(business.sector);
  const content = getMaquetteContent(business);
  const hours = business.hours.map((day) => `${day.day} : ${day.hours}`).join(" ; ");
  const services = content.services
    .map((service) => `- ${service.name} : ${service.description}${service.price ? ` (${service.price})` : ""}`)
    .join("\n");
  const strengths = content.strengths.map((strength) => `- ${strength.title} : ${strength.text}`).join("\n");
  const palette = da.palette.map((color) => `${color.name} ${color.hex}`).join(", ");

  return `# Site vitrine de ${business.name}

Tu es designer et développeur web senior. Crée le site vitrine d'une page de ce commerce, prêt à être mis en ligne.

## Le commerce
- Nom : ${business.name}
- Métier : ${sector.label} à ${business.address.city}
- Adresse : ${content.address}
- Téléphone : ${business.phone}
- Horaires : ${hours}
- Réputation : ${business.reviewCount} avis clients, note de ${frDecimal(business.rating)} sur 5
- Ouvert depuis ${business.registeredAt.slice(0, 4)}, gérant : ${business.owner.firstName} ${business.owner.lastName}

## Objectif
Un habitant de ${business.address.city} cherche ce métier sur son téléphone. En dix secondes, il doit trouver le numéro, les horaires et une raison de venir. L'action principale de la page : « ${content.cta.primary} ».

## Sections, dans l'ordre
1. En-tête : le nom du commerce, les ancres vers les sections, un bouton d'appel.
2. Haut de page : l'accroche, l'introduction, les deux boutons d'action.
3. Prestations, avec les prix.
4. Atouts.
5. À propos.
6. Avis clients (laisse des emplacements : les vrais avis seront ajoutés avec l'accord du commerçant).
7. Infos pratiques : horaires, adresse, plan, formulaire de contact.
8. Pied de page avec les mentions légales à compléter.

## Direction artistique : ${da.name}
${da.description}
- Palette : ${palette}
- Polices : ${da.fonts.display} pour les titres, ${da.fonts.text} pour le texte
- Ambiance : ${da.mood.join(", ")}
- Mise en page : ${LAYOUT[daId]}

## Contenus à utiliser
- Accroche : ${content.tagline}
- Introduction : ${content.intro}
- À propos : ${content.about.paragraphs.join(" ")}

Prestations :
${services}

Atouts :
${strengths}

## Contraintes
- Pensé d'abord pour le mobile : boutons d'appel et d'itinéraire toujours accessibles au pouce.
- Rapide : page légère, polices limitées à deux familles, images compressées.
- Accessible : contrastes suffisants, navigation au clavier, textes alternatifs.
- Référencement local : titre et description avec le métier et la ville, données structurées de commerce local, adresse et horaires en texte.
- N'invente ni photo ni avis : prévois des emplacements clairs pour les photos du commerçant.`;
}
