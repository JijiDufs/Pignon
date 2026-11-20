import type { City, Da, DaId, Heat, PipelineStage, Sector, SectorId, SiteStatus } from "../types";

// Marseille and Nice are centred inland: the businesses are scattered 4 km around, and none should land in the sea.
export const CITIES: City[] = [
  { id: "lille", name: "Lille", postalCode: "59000", department: "Nord (59)", lat: 50.6292, lng: 3.0573 },
  { id: "villeurbanne", name: "Villeurbanne", postalCode: "69100", department: "Rhône (69)", lat: 45.7719, lng: 4.8902 },
  { id: "lyon", name: "Lyon", postalCode: "69003", department: "Rhône (69)", lat: 45.764, lng: 4.8357 },
  { id: "bordeaux", name: "Bordeaux", postalCode: "33000", department: "Gironde (33)", lat: 44.8378, lng: -0.5792 },
  { id: "nantes", name: "Nantes", postalCode: "44000", department: "Loire-Atlantique (44)", lat: 47.2184, lng: -1.5536 },
  { id: "toulouse", name: "Toulouse", postalCode: "31000", department: "Haute-Garonne (31)", lat: 43.6047, lng: 1.4442 },
  { id: "marseille", name: "Marseille", postalCode: "13001", department: "Bouches-du-Rhône (13)", lat: 43.305, lng: 5.425 },
  { id: "rennes", name: "Rennes", postalCode: "35000", department: "Ille-et-Vilaine (35)", lat: 48.1173, lng: -1.6778 },
  { id: "strasbourg", name: "Strasbourg", postalCode: "67000", department: "Bas-Rhin (67)", lat: 48.5734, lng: 7.7521 },
  { id: "montpellier", name: "Montpellier", postalCode: "34000", department: "Hérault (34)", lat: 43.6108, lng: 3.8767 },
  { id: "grenoble", name: "Grenoble", postalCode: "38000", department: "Isère (38)", lat: 45.1885, lng: 5.7245 },
  { id: "nice", name: "Nice", postalCode: "06000", department: "Alpes-Maritimes (06)", lat: 43.736, lng: 7.262 },
];

/** Phone ranges reserved for fiction by the French regulator: no real shop can be reached by mistake. */
export const FICTION_PHONE_PREFIX: Record<string, string> = {
  villeurbanne: "04 65 71",
  lyon: "04 65 71",
  bordeaux: "05 36 49",
  nantes: "02 61 91",
  toulouse: "05 36 49",
  lille: "03 53 01",
  marseille: "04 65 71",
  rennes: "02 61 91",
  strasbourg: "03 53 01",
  montpellier: "04 65 71",
  grenoble: "04 65 71",
  nice: "04 65 71",
};

export const SECTORS: Sector[] = [
  { id: "garage", label: "Garage auto", plural: "Garages auto", ownerNoun: "le garagiste", naf: "45.20A", averageDeal: 1600 },
  { id: "restaurant", label: "Restaurant", plural: "Restaurants", ownerNoun: "le restaurateur", naf: "56.10A", averageDeal: 1800 },
  { id: "hairdresser", label: "Salon de coiffure", plural: "Salons de coiffure", ownerNoun: "le coiffeur", naf: "96.02A", averageDeal: 1100 },
  { id: "bakery", label: "Boulangerie", plural: "Boulangeries", ownerNoun: "le boulanger", naf: "10.71C", averageDeal: 1200 },
  { id: "plumber", label: "Plombier", plural: "Plombiers", ownerNoun: "le plombier", naf: "43.22A", averageDeal: 1400 },
  { id: "beauty", label: "Institut de beauté", plural: "Instituts de beauté", ownerNoun: "l'esthéticienne", naf: "96.02B", averageDeal: 1200 },
  { id: "florist", label: "Fleuriste", plural: "Fleuristes", ownerNoun: "la fleuriste", naf: "47.76Z", averageDeal: 1100 },
  { id: "electrician", label: "Électricien", plural: "Électriciens", ownerNoun: "l'électricien", naf: "43.21A", averageDeal: 1400 },
];

export const DAS: Da[] = [
  {
    id: "atelier",
    name: "Atelier",
    tagline: "Brut et direct, pour les métiers de la main.",
    description:
      "Des titres condensés très gras, de grands chiffres et l'orange des gilets de chantier. Un site qui parle comme on parle au comptoir : franchement.",
    palette: [
      { name: "Charbon", hex: "#1B1B1E" },
      { name: "Acier", hex: "#E8E6E1" },
      { name: "Signal", hex: "#FF5B1F" },
      { name: "Béton", hex: "#8C8A85" },
    ],
    fonts: { display: "Barlow Condensed", text: "Barlow" },
    mood: ["franc", "costaud", "sans détour"],
    bestFor: ["garage", "plumber", "electrician"],
  },
  {
    id: "maison",
    name: "Maison",
    tagline: "Chaleureux et soigné, comme une devanture repeinte chaque printemps.",
    description:
      "Un sérif généreux, du vert sapin et du jaune beurre, des compositions de carte ou d'ardoise. On sent l'odeur du pain avant d'avoir lu une ligne.",
    palette: [
      { name: "Lin", hex: "#F3EEE3" },
      { name: "Sapin", hex: "#1F3B2D" },
      { name: "Beurre", hex: "#F2C14E" },
      { name: "Griotte", hex: "#8E2F3A" },
    ],
    fonts: { display: "Fraunces", text: "Karla" },
    mood: ["artisanal", "généreux", "de quartier"],
    bestFor: ["bakery", "restaurant", "florist"],
  },
  {
    id: "clair",
    name: "Clair",
    tagline: "Net et rassurant, on trouve l'info en trois secondes.",
    description:
      "Beaucoup d'air, une grille stricte, un seul accent lagon. Le téléphone, les horaires et les tarifs sont là où on les cherche.",
    palette: [
      { name: "Blanc", hex: "#FFFFFF" },
      { name: "Ardoise", hex: "#14213D" },
      { name: "Lagon", hex: "#0B7A7C" },
      { name: "Givre", hex: "#EAF4F4" },
    ],
    fonts: { display: "Figtree", text: "Figtree" },
    mood: ["simple", "lisible", "professionnel"],
    bestFor: ["plumber", "electrician", "beauty", "hairdresser", "garage"],
  },
  {
    id: "neon",
    name: "Néon",
    tagline: "Du caractère, pour ceux qu'on reconnaît de loin.",
    description:
      "Des titres larges et massifs, du rose néon sur fond de minuit, des bandeaux qui défilent. Pour les adresses qui ont une personnalité et qui l'assument.",
    palette: [
      { name: "Minuit", hex: "#140F2D" },
      { name: "Rose néon", hex: "#FF3EA5" },
      { name: "Citron", hex: "#E6FF4D" },
      { name: "Lavande", hex: "#B8A6FF" },
    ],
    fonts: { display: "Unbounded", text: "Sora" },
    mood: ["nocturne", "pop", "affirmé"],
    bestFor: ["hairdresser", "restaurant", "beauty"],
  },
];

export const RECOMMENDED_DAS: Record<SectorId, DaId[]> = {
  garage: ["atelier", "clair", "neon"],
  plumber: ["clair", "atelier", "neon"],
  electrician: ["clair", "atelier", "neon"],
  bakery: ["maison", "clair", "neon"],
  restaurant: ["maison", "neon", "clair"],
  florist: ["maison", "clair", "neon"],
  hairdresser: ["neon", "clair", "maison"],
  beauty: ["clair", "maison", "neon"],
};

export const SITE_STATUS: Record<SiteStatus, { label: string; short: string; description: string; pitch: string }> = {
  none: {
    label: "Aucun site",
    short: "Aucun site",
    description: "Le commerce n'a aucune adresse web : en ligne, il n'existe que par les annuaires.",
    pitch: "Quand on vous cherche sur Internet, on tombe sur vos concurrents, parce que vous n'avez pas de site.",
  },
  "social-only": {
    label: "Réseaux sociaux seulement",
    short: "Réseaux seuls",
    description: "Une page sur un réseau social tient lieu de site.",
    pitch: "Votre page est très bien pour vos habitués, mais elle ne ressort presque jamais dans une recherche.",
  },
  dead: {
    label: "Site mort",
    short: "Site mort",
    description: "Une adresse est affichée partout, mais elle ne mène plus nulle part.",
    pitch: "Le lien de votre site mène à une page d'erreur : chaque personne qui clique repart aussitôt.",
  },
  insecure: {
    label: "Non sécurisé",
    short: "Non sécurisé",
    description: "Le site n'a pas de HTTPS : les navigateurs le signalent comme dangereux.",
    pitch: "Votre site s'affiche avec la mention « Non sécurisé », et ça fait fuir les gens avant même qu'ils lisent.",
  },
  "not-mobile": {
    label: "Pas adapté au mobile",
    short: "Pas mobile",
    description: "Le site est illisible sur un téléphone, là où se font la plupart des recherches.",
    pitch: "Sur un téléphone, il faut zoomer pour lire votre site. Or c'est là que vos clients vous cherchent.",
  },
  outdated: {
    label: "Site daté",
    short: "Site daté",
    description: "Le site fonctionne, mais il n'a pas bougé depuis des années.",
    pitch: "Votre site date de plusieurs années et il ne donne plus une image juste de votre travail.",
  },
  ok: {
    label: "Site correct",
    short: "Site correct",
    description: "Le site est récent, sécurisé et lisible sur mobile.",
    pitch: "Votre site est en bon état.",
  },
};

export const HEAT: Record<Heat, { label: string; min: number; description: string }> = {
  hot: { label: "Brûlant", min: 80, description: "Tout est réuni : à appeler cette semaine." },
  warm: { label: "Chaud", min: 60, description: "Une vraie opportunité, avec de bons arguments." },
  mild: { label: "Tiède", min: 40, description: "Possible, mais il faudra convaincre." },
  cold: { label: "Froid", min: 0, description: "Peu de raisons d'appeler pour l'instant." },
};

export const PIPELINE_STAGES: { id: PipelineStage; label: string; description: string }[] = [
  { id: "to-call", label: "À appeler", description: "Repéré, pas encore contacté." },
  { id: "called", label: "Appelé", description: "Un premier échange a eu lieu." },
  { id: "mockup-sent", label: "Maquette envoyée", description: "Le commerçant a reçu le lien de sa maquette." },
  { id: "meeting", label: "Rendez-vous", description: "Une date est fixée pour se voir." },
  { id: "won", label: "Signé", description: "Le site est vendu." },
  { id: "lost", label: "Perdu", description: "Pas intéressé pour le moment." },
];

export function getCity(id: string): City | undefined {
  return CITIES.find((city) => city.id === id);
}

export function getSector(id: SectorId): Sector {
  return SECTORS.find((sector) => sector.id === id) ?? SECTORS[0];
}

export function getDa(id: DaId): Da {
  return DAS.find((da) => da.id === id) ?? DAS[0];
}

export function heatOf(score: number): Heat {
  if (score >= HEAT.hot.min) return "hot";
  if (score >= HEAT.warm.min) return "warm";
  if (score >= HEAT.mild.min) return "mild";
  return "cold";
}
