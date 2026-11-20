import type { Business, MaquetteContent, SectorId } from "../types";
import { hashText } from "./prng";
import { getSector } from "./reference";
import { frDecimal } from "./site";

interface Preset {
  taglines: string[];
  intros: string[];
  services: { name: string; description: string; price?: string }[];
  strengths: { title: string; text: string }[];
  aboutTitle: string;
  about: string[];
  cta: string;
  reviews: { author: string; text: string }[];
}

/** Website copy per trade. Tokens: {name}, {first}, {city}, {year}. */
const PRESETS: Record<SectorId, Preset> = {
  garage: {
    taglines: ["Votre voiture entre de bonnes mains, à {city}.", "La mécanique sérieuse, sans mauvaise surprise."],
    intros: [
      "Entretien, réparation et diagnostic toutes marques. Devis avant travaux, délais tenus, et on vous explique ce qu'on fait.",
      "Depuis {year}, {name} entretient et répare les voitures du quartier. Un devis clair, un prix annoncé, une voiture rendue à l'heure.",
    ],
    services: [
      { name: "Révision et vidange", description: "Vidange, filtres et contrôle de 40 points.", price: "à partir de 79 €" },
      { name: "Freinage", description: "Disques, plaquettes, liquide de frein.", price: "à partir de 89 €" },
      { name: "Pneus et géométrie", description: "Montage, équilibrage, parallélisme.", price: "à partir de 15 € par pneu" },
      { name: "Diagnostic électronique", description: "Lecture des défauts et recherche de panne.", price: "49 €" },
      { name: "Climatisation", description: "Recharge et recherche de fuite.", price: "à partir de 69 €" },
      { name: "Avant le contrôle technique", description: "Pré-contrôle et remise en état.", price: "sur devis" },
    ],
    strengths: [
      { title: "Devis avant travaux", text: "Rien n'est fait sans votre accord, et le prix annoncé est le prix payé." },
      { title: "Toutes marques", text: "Citadines, familiales, utilitaires : on connaît les modèles qui roulent ici." },
      { title: "Véhicule de prêt", text: "Sur réservation, pour ne pas rester à pied pendant les réparations." },
    ],
    aboutTitle: "Un garage de quartier, pas une chaîne",
    about: [
      "{first} a ouvert {name} en {year}, avec une idée simple : traiter chaque voiture comme la sienne.",
      "Ici, vous parlez au mécanicien qui s'occupe de votre véhicule. Il vous montre la pièce usée, et vous dit ce qui peut attendre et ce qui ne peut pas.",
    ],
    cta: "Prendre rendez-vous",
    reviews: [
      { author: "Sandrine L.", text: "Devis respecté au centime, voiture rendue le soir même." },
      { author: "Mickaël D.", text: "On m'a montré la pièce changée et expliqué pourquoi. C'est rare." },
      { author: "Hélène P.", text: "Accueil simple et honnête. Je n'irai plus ailleurs." },
    ],
  },
  restaurant: {
    taglines: ["Une cuisine de saison, faite ici, à {city}.", "La bonne table du quartier."],
    intros: [
      "Des produits du marché, une carte courte qui change souvent, et une salle où l'on prend le temps.",
      "Depuis {year}, {name} cuisine chaque jour des plats faits maison. Réservez votre table en quelques secondes.",
    ],
    services: [
      { name: "Menu du midi", description: "Entrée, plat, dessert, du mardi au vendredi.", price: "16,50 €" },
      { name: "Plat du jour", description: "Selon le marché du matin.", price: "12,90 €" },
      { name: "La carte", description: "Entrées, viandes, poissons et desserts maison.", price: "plats de 15 à 24 €" },
      { name: "Menu du soir", description: "Trois services, avec ou sans accord de vins.", price: "32 €" },
      { name: "Groupes et privatisation", description: "Anniversaires, repas d'équipe, jusqu'à 40 couverts.", price: "sur devis" },
      { name: "À emporter", description: "Les plats de la carte, à venir chercher." },
    ],
    strengths: [
      { title: "Tout est fait maison", text: "Des fonds de sauce aux desserts, rien n'arrive tout prêt." },
      { title: "Des producteurs d'ici", text: "Maraîchers et éleveurs de la région, nommés sur la carte." },
      { title: "Une salle à taille humaine", text: "Trente couverts, pas plus : on vous reconnaît à la deuxième visite." },
    ],
    aboutTitle: "Une table tenue par ceux qui cuisinent",
    about: [
      "{first} est aux fourneaux de {name} depuis {year}. La carte tient sur une page, parce que tout est préparé sur place.",
      "Le midi, on vient pour le plat du jour. Le soir, on prend son temps.",
    ],
    cta: "Réserver une table",
    reviews: [
      { author: "Julien R.", text: "Le plat du jour vaut le détour, et l'accueil aussi." },
      { author: "Nora B.", text: "Une carte courte et tout est bon. On reviendra." },
      { author: "Patrick M.", text: "Parfait pour un repas d'équipe, service attentif." },
    ],
  },
  hairdresser: {
    taglines: ["Une coupe qui vous ressemble, à {city}.", "Le salon où l'on vous écoute avant de couper."],
    intros: [
      "Coupe, couleur et soin pour femmes, hommes et enfants. Sur rendez-vous, sans attente.",
      "Depuis {year}, {name} coiffe le quartier. On prend le temps de comprendre ce que vous voulez, puis on s'y tient.",
    ],
    services: [
      { name: "Coupe femme", description: "Shampoing, coupe, brushing.", price: "à partir de 38 €" },
      { name: "Coupe homme", description: "Aux ciseaux ou à la tondeuse.", price: "22 €" },
      { name: "Couleur et balayage", description: "Diagnostic, couleur, soin.", price: "à partir de 55 €" },
      { name: "Barbe", description: "Taille et contours.", price: "15 €" },
      { name: "Coiffure enfant", description: "Jusqu'à 12 ans.", price: "16 €" },
      { name: "Soin profond", description: "Masque et massage du cuir chevelu.", price: "18 €" },
    ],
    strengths: [
      { title: "On écoute d'abord", text: "Cinq minutes pour parler de ce que vous voulez, avant de toucher aux ciseaux." },
      { title: "Des produits doux", text: "Colorations sans ammoniaque, soins fabriqués en France." },
      { title: "À l'heure", text: "Votre rendez-vous commence à l'heure prévue." },
    ],
    aboutTitle: "Un salon à taille humaine",
    about: [
      "{first} a ouvert {name} en {year}, après dix ans passés dans les salons de la ville.",
      "Peu de fauteuils, pas de musique trop forte, et le temps de discuter de ce qui vous va.",
    ],
    cta: "Prendre rendez-vous",
    reviews: [
      { author: "Laure T.", text: "Enfin quelqu'un qui coupe ce que j'ai demandé." },
      { author: "Yanis K.", text: "Dégradé impeccable, et toujours à l'heure." },
      { author: "Monique F.", text: "Ma couleur tient bien et mes cheveux vont mieux." },
    ],
  },
  bakery: {
    taglines: ["Le pain du matin, pétri et cuit sur place.", "Votre boulangerie artisanale à {city}."],
    intros: [
      "Pains au levain, viennoiseries pur beurre et pâtisseries de saison, fabriqués chaque nuit dans notre fournil.",
      "Depuis {year}, {name} façonne son pain à la main. Passez commande pour vos gâteaux et vos buffets.",
    ],
    services: [
      { name: "Pains", description: "Tradition, campagne, seigle, céréales, au levain naturel.", price: "baguette tradition 1,30 €" },
      { name: "Viennoiseries", description: "Croissants et pains au chocolat pur beurre.", price: "croissant 1,20 €" },
      { name: "Pâtisseries", description: "Tartes de saison, éclairs, entremets.", price: "à partir de 3,20 €" },
      { name: "Formule déjeuner", description: "Sandwich, dessert, boisson.", price: "8,50 €" },
      { name: "Gâteaux sur commande", description: "Anniversaires, baptêmes, mariages.", price: "sur devis" },
      { name: "Plateaux et buffets", description: "Mini-viennoiseries, pains surprises.", price: "sur devis" },
    ],
    strengths: [
      { title: "Tout est fait ici", text: "Pétri, façonné et cuit dans le fournil, derrière la boutique." },
      { title: "Des farines de la région", text: "Un meunier à moins de cent kilomètres, le même depuis des années." },
      { title: "Du pain chaud toute la journée", text: "Trois fournées par jour, la dernière à 17 h." },
    ],
    aboutTitle: "Artisans boulangers",
    about: [
      "{first} tient le fournil de {name} depuis {year}.",
      "La pâte repose une nuit entière avant d'être cuite. C'est plus long, et ça se goûte.",
    ],
    cta: "Commander un gâteau",
    reviews: [
      { author: "Élodie V.", text: "La meilleure tradition du quartier, encore chaude à 17 h." },
      { author: "Bernard C.", text: "Le gâteau d'anniversaire était superbe et très bon." },
      { author: "Sarah A.", text: "Des croissants qui ont le goût du beurre." },
    ],
  },
  plumber: {
    taglines: ["Un plombier qui répond, à {city} et alentour.", "Dépannage, chauffage, salle de bain."],
    intros: [
      "Fuites, chauffe-eau, chaudières et salles de bain. Intervention rapide, devis gratuit, travail garanti.",
      "Depuis {year}, {name} dépanne et installe chez les particuliers du secteur. On se déplace vite et on annonce le prix avant de commencer.",
    ],
    services: [
      { name: "Dépannage", description: "Fuite, canalisation bouchée, chasse d'eau.", price: "déplacement 39 €" },
      { name: "Chauffe-eau", description: "Remplacement et entretien.", price: "à partir de 490 € posé" },
      { name: "Chaudière", description: "Entretien annuel et réparation.", price: "entretien 129 €" },
      { name: "Salle de bain", description: "Douche à l'italienne, meuble, faïence.", price: "sur devis" },
      { name: "Robinetterie", description: "Mitigeurs, WC, évier.", price: "à partir de 85 €" },
      { name: "Recherche de fuite", description: "Sans casse, avec un rapport pour l'assurance.", price: "sur devis" },
    ],
    strengths: [
      { title: "On répond au téléphone", text: "Et on vous dit tout de suite quand on peut passer." },
      { title: "Devis gratuit", text: "Le prix est écrit avant le début des travaux." },
      { title: "Travail garanti", text: "Si ça fuit encore, on revient sans rien facturer." },
    ],
    aboutTitle: "Un artisan, pas une plateforme",
    about: [
      "{first} a créé {name} en {year}, et c'est toujours {first} qui décroche et qui se déplace.",
      "Pas de sous-traitance, pas de forfait surprise : un artisan du secteur, joignable et assuré.",
    ],
    cta: "Demander un devis",
    reviews: [
      { author: "Christine G.", text: "Fuite réparée dans l'heure, prix annoncé avant." },
      { author: "Rémi S.", text: "Salle de bain refaite dans les délais, chantier propre." },
      { author: "Odile N.", text: "Rappelée dans le quart d'heure. Sérieux." },
    ],
  },
  beauty: {
    taglines: ["Une heure pour vous, à {city}.", "Soins du visage, épilation, beauté des mains."],
    intros: [
      "Soins du visage, épilations, manucure et modelages dans une cabine calme, avec des produits choisis.",
      "Depuis {year}, {name} prend soin de vous sans vous presser. Réservez votre moment en quelques secondes.",
    ],
    services: [
      { name: "Soin du visage", description: "Nettoyage, gommage, masque, modelage.", price: "à partir de 49 €" },
      { name: "Épilation", description: "Cire tiède, toutes zones.", price: "à partir de 9 €" },
      { name: "Manucure", description: "Mise en beauté et pose de vernis.", price: "28 €" },
      { name: "Vernis semi-permanent", description: "Tenue de trois semaines.", price: "32 €" },
      { name: "Modelage du corps", description: "Relaxant ou tonique, une heure.", price: "59 €" },
      { name: "Beauté du regard", description: "Teinture et rehaussement de cils.", price: "à partir de 22 €" },
    ],
    strengths: [
      { title: "Une cabine au calme", text: "Une seule cliente à la fois, téléphone coupé." },
      { title: "Des produits choisis", text: "Des marques françaises, essayées avant d'être proposées." },
      { title: "Des conseils honnêtes", text: "On vous dit ce dont votre peau a besoin, pas ce qu'il y a à vendre." },
    ],
    aboutTitle: "Un institut où l'on prend son temps",
    about: [
      "{first} a ouvert {name} en {year}, pour proposer des soins sans cadence imposée.",
      "Chaque rendez-vous commence par quelques questions, pour adapter le soin à votre peau et à votre journée.",
    ],
    cta: "Réserver un soin",
    reviews: [
      { author: "Anaïs D.", text: "Je ressors détendue à chaque fois. Un vrai moment à moi." },
      { author: "Valérie H.", text: "Épilation soignée et sans douleur, ponctuelle." },
      { author: "Inès M.", text: "De bons conseils, sans jamais pousser à l'achat." },
    ],
  },
  florist: {
    taglines: ["Des fleurs fraîches, composées devant vous.", "Votre fleuriste à {city}."],
    intros: [
      "Bouquets de saison, plantes et compositions pour tous les moments. Livraison dans la ville le jour même.",
      "Depuis {year}, {name} compose des bouquets avec les fleurs du moment. Passez commande, on s'occupe du reste.",
    ],
    services: [
      { name: "Bouquets de saison", description: "Composés chaque matin selon l'arrivage.", price: "à partir de 25 €" },
      { name: "Plantes", description: "D'intérieur et de balcon, avec les conseils d'entretien.", price: "à partir de 12 €" },
      { name: "Mariage", description: "Bouquet de mariée, boutonnières, décor de table.", price: "sur devis" },
      { name: "Deuil", description: "Gerbes et coussins, livrés à l'heure dite.", price: "à partir de 60 €" },
      { name: "Abonnement fleuri", description: "Un bouquet livré chaque semaine ou chaque mois.", price: "à partir de 29 € par mois" },
      { name: "Livraison", description: "Dans la ville, le jour même avant 16 h.", price: "6 €" },
    ],
    strengths: [
      { title: "Des fleurs de saison", text: "Pas de roses en plein hiver : ce qui pousse maintenant, et qui tient." },
      { title: "Composé devant vous", text: "Vous choisissez les couleurs, on fait le bouquet pendant que vous attendez." },
      { title: "Livré le jour même", text: "Commandé avant 16 h, déposé avant le soir." },
    ],
    aboutTitle: "Une boutique qui sent le frais",
    about: [
      "{first} a ouvert {name} en {year}, et choisit ses fleurs en personne, chaque semaine.",
      "Dites pour qui et pour quoi : on trouve le bouquet qui convient, à votre budget.",
    ],
    cta: "Commander un bouquet",
    reviews: [
      { author: "Céline B.", text: "Un bouquet magnifique, qui a tenu deux semaines." },
      { author: "Thomas W.", text: "Livré à l'heure pour l'anniversaire de ma mère. Parfait." },
      { author: "Gisèle R.", text: "Toujours de bon conseil pour mes plantes." },
    ],
  },
  electrician: {
    taglines: ["Votre électricien à {city}, du dépannage à la rénovation.", "Une installation sûre, un devis clair."],
    intros: [
      "Dépannage, mise aux normes, tableau électrique et bornes de recharge. Devis gratuit et intervention soignée.",
      "Depuis {year}, {name} intervient chez les particuliers et les commerces du secteur. Travail propre, prix annoncé à l'avance.",
    ],
    services: [
      { name: "Dépannage", description: "Panne, disjoncteur qui saute, prise défectueuse.", price: "déplacement 45 €" },
      { name: "Mise aux normes", description: "Diagnostic et remise en sécurité.", price: "sur devis" },
      { name: "Tableau électrique", description: "Remplacement et ajout de circuits.", price: "à partir de 690 €" },
      { name: "Borne de recharge", description: "Installation certifiée pour véhicule électrique.", price: "à partir de 1 190 €" },
      { name: "Éclairage", description: "Intérieur, extérieur, détecteurs.", price: "sur devis" },
      { name: "Rénovation complète", description: "Appartement ou maison, du plan à la mise en service.", price: "sur devis" },
    ],
    strengths: [
      { title: "Installateur qualifié", text: "Des installations conformes, avec l'attestation qui va avec." },
      { title: "Devis gratuit", text: "Détaillé ligne par ligne, sans supplément à la fin." },
      { title: "Chantier laissé propre", text: "On protège, on range, on nettoie avant de partir." },
    ],
    aboutTitle: "Un électricien du secteur",
    about: [
      "{first} a créé {name} en {year}, après avoir travaillé sur des chantiers de toutes tailles.",
      "Du simple dépannage à la rénovation complète, le même soin et le même interlocuteur.",
    ],
    cta: "Demander un devis",
    reviews: [
      { author: "Fabrice J.", text: "Tableau refait en une journée, explications claires." },
      { author: "Martine O.", text: "Dépannage le jour même, tarif annoncé au téléphone." },
      { author: "Karim Z.", text: "Borne de recharge posée proprement, rien à redire." },
    ],
  },
};

/** The text of a showcase website for this business. Deterministic. */
export function getMaquetteContent(business: Business): MaquetteContent {
  const preset = PRESETS[business.sector];
  const variant = hashText(business.id);
  const year = business.registeredAt.slice(0, 4);
  const fill = (text: string) =>
    text
      .replaceAll("{name}", business.name)
      .replaceAll("{first}", business.owner.firstName)
      .replaceAll("{city}", business.address.city)
      .replaceAll("{year}", year);

  return {
    businessName: business.name,
    sector: business.sector,
    sectorLabel: getSector(business.sector).label,
    city: business.address.city,
    tagline: fill(preset.taglines[variant % preset.taglines.length]),
    intro: fill(preset.intros[(variant >>> 3) % preset.intros.length]),
    services: preset.services,
    strengths: preset.strengths,
    about: { title: preset.aboutTitle, paragraphs: preset.about.map(fill) },
    facts: [
      { value: String(business.reviewCount), label: "avis clients" },
      { value: `${frDecimal(business.rating)} / 5`, label: "note moyenne" },
      { value: year, label: "année d'ouverture" },
    ],
    cta: { primary: preset.cta, secondary: `Appeler le ${business.phone}` },
    phone: business.phone,
    address: `${business.address.street}, ${business.address.postalCode} ${business.address.city}`,
    hours: business.hours,
    reviewSummary: { rating: business.rating, count: business.reviewCount },
    sampleReviews: preset.reviews,
  };
}
