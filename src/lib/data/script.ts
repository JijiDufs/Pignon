import type { Business, CallScript, SectorId } from "../types";
import { hashText } from "./prng";
import { frDecimal } from "./site";

interface SectorTalk {
  /** "un garage" — what a customer types in a search */
  search: string;
  /** "au garage" — where the meeting happens */
  place: string;
  /** What a website lets this trade sell more of */
  upsell: string;
  bestTime: string;
  bestTimeWhy: string;
}

const TALK: Record<SectorId, SectorTalk> = {
  garage: {
    search: "un garage",
    place: "au garage",
    upsell: "mettre en avant la carrosserie plutôt que les vidanges",
    bestTime: "Entre 14 h et 16 h 30",
    bestTimeWhy: "Le matin, ce sont les dépôts de voitures ; en fin de journée, les restitutions. Le milieu d'après-midi est le seul moment calme.",
  },
  restaurant: {
    search: "un restaurant",
    place: "au restaurant",
    upsell: "remplir les mardis soir plutôt que refuser du monde le samedi",
    bestTime: "Entre 15 h et 17 h",
    bestTimeWhy: "Entre les deux services, la salle est vide et le patron passe ses commandes.",
  },
  hairdresser: {
    search: "un coiffeur",
    place: "au salon",
    upsell: "faire venir des couleurs plutôt que des coupes rapides",
    bestTime: "Le mardi ou le mercredi, vers 14 h",
    bestTimeWhy: "Les débuts de semaine sont creux. Évite le vendredi et le samedi : les fauteuils sont pleins.",
  },
  bakery: {
    search: "une boulangerie",
    place: "à la boulangerie",
    upsell: "vendre plus de gâteaux sur commande",
    bestTime: "Entre 14 h et 16 h",
    bestTimeWhy: "La nuit de fournil et le coup de feu du matin sont passés, la sortie des écoles n'a pas commencé.",
  },
  plumber: {
    search: "un plombier",
    place: "là où ça vous arrange",
    upsell: "décrocher des salles de bain plutôt que des dépannages",
    bestTime: "Entre 12 h et 13 h 30, ou après 17 h 30",
    bestTimeWhy: "En journée il a les mains sous un évier. Il répond pendant sa pause ou en rentrant de chantier.",
  },
  beauty: {
    search: "un institut de beauté",
    place: "à l'institut",
    upsell: "remplir les créneaux du matin",
    bestTime: "Le mardi ou le jeudi, en fin de matinée",
    bestTimeWhy: "Entre deux rendez-vous, avant la pause de midi qui est très demandée.",
  },
  florist: {
    search: "un fleuriste",
    place: "à la boutique",
    upsell: "prendre des mariages et des abonnements",
    bestTime: "Le mardi ou le mercredi, entre 14 h et 16 h",
    bestTimeWhy: "Loin des week-ends et des fêtes, quand la boutique est calme.",
  },
  electrician: {
    search: "un électricien",
    place: "là où ça vous arrange",
    upsell: "décrocher des rénovations plutôt que des dépannages",
    bestTime: "Entre 12 h et 13 h 30, ou après 17 h 30",
    bestTimeWhy: "Sur un chantier il ne décroche pas. Il est disponible à la pause et en fin de journée.",
  },
};

const SLOTS: [string, string][] = [
  ["Mardi 14 h", "jeudi 16 h"],
  ["Mercredi 15 h", "vendredi 14 h"],
  ["Lundi 14 h 30", "jeudi 15 h"],
];

function euros(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

function reasonLine(business: Business, talk: SectorTalk): string {
  const { site, competitors, reviewCount, rating, name } = business;
  const city = business.address.city;
  const withSite = competitors.filter((competitor) => competitor.hasSite).length;

  const hook = business.isNew
    ? `J'ai vu que vous veniez d'ouvrir ${name}.`
    : reviewCount >= 40
      ? `J'ai trouvé ${name} : ${reviewCount} avis, ${frDecimal(rating)} de moyenne, c'est l'une des meilleures notes du coin.`
      : `J'ai trouvé ${name} en cherchant ${talk.search} à ${city}.`;

  switch (site.status) {
    case "none": {
      const neighbours =
        withSite >= 2
          ? `${withSite} de vos trois voisins les plus proches ont un site, et vous non. Quelqu'un qui cherche ${talk.search} le soir sur son téléphone tombe sur eux.`
          : withSite === 1
            ? `un de vos voisins a déjà un site, et vous non. Quelqu'un qui cherche ${talk.search} le soir sur son téléphone tombe sur lui.`
            : `personne autour de vous n'a de site. Le premier qui en aura un prendra toute la place, autant que ce soit vous.`;
      return `${hook} Le souci, c'est que ${neighbours}`;
    }
    case "social-only":
      return `${hook} Votre page Facebook est bien tenue, mais elle ne ressort presque jamais quand on cherche ${talk.search} à ${city}. Vos avis ne mènent nulle part.`;
    case "dead":
      return site.platform === "business.site"
        ? `${hook} Par contre, le lien de votre site ne fonctionne plus. C'était un site Google, et ce service a fermé en 2024 : quand on clique, on tombe sur une page d'erreur.`
        : `${hook} Par contre, le lien de votre site ne fonctionne plus : quand on clique dessus, on tombe sur une page d'erreur.`;
    case "insecure":
      return `${hook} Par contre, quand on ouvre votre site, le navigateur affiche « Non sécurisé ». Beaucoup de gens font demi-tour à ce moment-là.`;
    case "not-mobile":
      return `${hook} Par contre, sur un téléphone, votre site est illisible : il faut zoomer pour trouver votre numéro.`;
    case "outdated":
      return `${hook} Par contre, votre site date de ${site.copyrightYear}, et il ne montre plus ce que vous faites aujourd'hui.${
        site.paysSubscription ? " Et je crois que vous payez encore un abonnement pour ça." : ""
      }`;
    case "ok":
      return `${hook} Votre site est en bon état, je voulais simplement me présenter.`;
  }
}

function statusObjection(business: Business): { id: string; objection: string; answer: string } {
  const { site, reviewCount, competitors } = business;
  switch (site.status) {
    case "social-only":
      return {
        id: "facebook",
        objection: "J'ai déjà une page Facebook.",
        answer: `Et gardez-la, elle est parfaite pour vos habitués. Mais sur Google, Facebook ne ressort presque jamais, et vos ${reviewCount} avis ne mènent nulle part. Le site, c'est ce qui les fait travailler.`,
      };
    case "outdated":
    case "insecure":
    case "not-mobile":
      return site.paysSubscription
        ? {
            id: "annuaire",
            objection: "J'ai déjà un site avec PagesJaunes.",
            answer: `Justement : vous payez chaque mois pour un site qui date de ${site.copyrightYear}. Pour un budget comparable, vous pouvez avoir un site à vous, qui vous ressemble. Regardez la maquette et comparez.`,
          }
        : {
            id: "site",
            objection: "J'ai déjà un site.",
            answer: `Oui, je l'ai regardé. Il date de ${site.copyrightYear}, et sur un téléphone il est difficile à lire. La maquette vous montre ce que ça donnerait aujourd'hui, avec le même contenu.`,
          };
    case "dead":
      return {
        id: "site",
        objection: "J'ai déjà un site.",
        answer: "Je l'ai cherché : le lien mène à une page d'erreur. C'est sans doute arrivé sans que vous le sachiez. La maquette vous montre par quoi le remplacer.",
      };
    default: {
      const neighbour = competitors.find((competitor) => competitor.hasSite)?.name;
      return {
        id: "connu",
        objection: "Les gens me connaissent, je n'ai pas besoin de site.",
        answer: `Vos habitués, oui. Mais quelqu'un qui vient d'emménager cherche sur son téléphone, et aujourd'hui il trouve ${neighbour ?? "vos concurrents"}.`,
      };
    }
  }
}

/** A cold-call script written with the real data of the business. The caller says "vous"; the tips say "tu". */
export function buildCallScript(business: Business, callerFirstName: string): CallScript {
  const talk = TALK[business.sector];
  const { owner } = business;
  const address = owner.civility === "Mme" ? "madame" : "monsieur";
  const [slotA, slotB] = SLOTS[hashText(business.id) % SLOTS.length];
  const caller = callerFirstName.trim() || "Camille";

  return {
    businessId: business.id,
    bestTime: talk.bestTime,
    bestTimeWhy: talk.bestTimeWhy,
    steps: [
      {
        id: "opening",
        title: "L'ouverture",
        durationSec: 10,
        line: `Bonjour, ${address} ${owner.lastName} ? ${caller}, je crée des sites web à ${business.address.city}. Je vous le dis tout de suite : c'est un appel à froid. Je vous prends 30 secondes, et si ça ne vous parle pas, vous raccrochez, promis.`,
        tip: "Dis toi-même que c'est un appel à froid : ça désarme. Et laisse-lui le droit de raccrocher, il s'en servira rarement.",
      },
      {
        id: "reason",
        title: "La raison",
        durationSec: 15,
        line: reasonLine(business, talk),
        tip: "Cite un fait vrai dans les quinze premières secondes : il comprend que tu as regardé son commerce, pas une liste.",
      },
      {
        id: "proof",
        title: "La preuve",
        durationSec: 20,
        line: "Du coup, je me suis permis de vous préparer une maquette de site, avec vos horaires et vos prestations. C'est gratuit, ça ne vous engage à rien. Je vous l'envoie par SMS maintenant, et vous la regardez pendant qu'on parle ?",
        tip: "Envoie le lien pendant l'appel, puis tais-toi. Laisse-le regarder et réagir en premier.",
      },
      {
        id: "closing",
        title: "Le rendez-vous",
        durationSec: 15,
        line: `Le but, ce n'est pas de signer au téléphone. Je passe quinze minutes ${talk.place}, je vous montre les trois styles en vrai, et vous choisissez. ${slotA} ou ${slotB}, qu'est-ce qui vous arrange ?`,
        tip: "Propose deux créneaux précis. « Vous êtes disponible quand ? » obtient « je vous rappelle ».",
      },
    ],
    objections: [
      statusObjection(business),
      {
        id: "clients",
        objection: "J'ai assez de clients.",
        answer: `C'est pour ça que vos avis sont bons. Le site ne sert pas à en avoir plus, il sert à choisir lesquels : ${talk.upsell}.`,
      },
      {
        id: "prix",
        objection: "C'est combien ?",
        answer: `Ça dépend de ce que vous voulez. Pour une vitrine comme celle de la maquette, comptez autour de ${euros(business.estimatedDeal)}. Je vous montre tout quand on se voit, et vous décidez sans pression.`,
      },
      {
        id: "mail",
        objection: "Envoyez-moi un mail.",
        answer: "Avec plaisir. Vous avez déjà le lien par SMS ; je vous rappelle jeudi pour avoir votre avis, plutôt le matin ou en fin de journée ?",
      },
      {
        id: "temps",
        objection: "Je n'ai pas le temps.",
        answer: "Je comprends, c'est pour ça que j'ai fait la maquette avant d'appeler. Regardez-la ce soir, ça prend deux minutes, et je vous rappelle demain à l'heure qui vous arrange.",
      },
    ],
    smsTemplate: `Bonjour ${owner.civility} ${owner.lastName}, c'est ${caller}. Voici la maquette dont je vous parlais : {lien} Dites-moi ce que vous en pensez.`,
  };
}
