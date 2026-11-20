import type { DayHours, SectorId } from "../types";

/** Raw material for invented, believable French small businesses. */

export const FEMALE_NAMES = [
  "Camille", "Léonie", "Inès", "Sophie", "Élise", "Nadia", "Margaux", "Yasmine", "Claire",
  "Jeanne", "Lucie", "Amina", "Manon", "Chloé", "Fatima", "Julie", "Laura", "Mathilde",
];

export const MALE_NAMES = [
  "Karim", "Antoine", "Marco", "Thomas", "Mehdi", "Julien", "Paulo", "Nicolas", "Samir",
  "Hugo", "Vincent", "Luca", "Olivier", "Rachid", "Étienne", "Baptiste", "Malik", "Xavier",
];

export const SURNAMES = [
  "Ferreira", "Benali", "Nguyen", "Martin", "Lefèvre", "Moreau", "Diallo", "Garcia", "Rossi",
  "Petit", "Kaya", "Bonnard", "Morel", "Perrin", "Da Silva", "Haddad", "Roux", "Fournier",
  "Girard", "Lambert", "Traoré", "Marchand", "Colin", "Renaud", "Schmitt", "Leroy", "Faure",
  "Mercier", "Blanc", "Chevalier", "Robin", "Masson", "Sanchez", "Dupuis", "Charpentier", "Aubert",
];

/** All masculine, so "du {place}" is always correct. */
export const PLACES = [
  "Centre", "Marché", "Parc", "Pont", "Canal", "Square", "Théâtre", "Stade", "Clocher", "Lavoir", "Moulin", "Carrefour",
];

/** Street names found in almost every French town. */
export const STREETS = [
  "rue de la République", "avenue Jean Jaurès", "rue Victor Hugo", "cours Émile Zola", "rue Pasteur",
  "rue Gambetta", "boulevard Carnot", "place de la Mairie", "rue Anatole France", "avenue du Général de Gaulle",
  "rue Jules Ferry", "rue des Écoles", "rue du 8 Mai 1945", "rue Voltaire", "rue Paul Bert",
  "avenue de la Gare", "rue Nationale", "rue de Verdun", "rue Jean Moulin", "rue Lamartine",
  "avenue Aristide Briand", "rue du Marché", "rue de la Paix", "rue Marcel Sembat", "rue Pierre Curie",
  "boulevard de la Liberté", "rue des Tilleuls", "rue du Moulin",
];

/** "de Camille", "d'Inès" */
export function de(name: string): string {
  return /^[AEIOUYÉÈÊH]/i.test(name) ? `d'${name}` : `de ${name}`;
}

interface NameContext {
  first: string;
  last: string;
  place: string;
}

export const NAME_PATTERNS: Record<SectorId, ((context: NameContext) => string)[]> = {
  garage: [
    (c) => `Garage ${c.last}`,
    (c) => `Auto Service ${c.last}`,
    (c) => `Garage du ${c.place}`,
    (c) => `Carrosserie ${c.last}`,
    (c) => `${c.last} Automobiles`,
    (c) => `Garage ${c.last} & Fils`,
    (c) => `Atelier Mécanique ${c.last}`,
  ],
  restaurant: [
    (c) => `Le Bistrot du ${c.place}`,
    (c) => `Chez ${c.first}`,
    (c) => `La Table ${de(c.first)}`,
    (c) => `Le Comptoir ${c.last}`,
    (c) => `Brasserie du ${c.place}`,
    (c) => `L'Assiette ${de(c.first)}`,
    (c) => `Le Petit ${c.last}`,
    (c) => `Pizzeria Da ${c.first}`,
  ],
  hairdresser: [
    (c) => `L'Atelier ${de(c.first)}`,
    (c) => `Salon ${c.last}`,
    (c) => `${c.first} Coiffure`,
    (c) => `Coiffure du ${c.place}`,
    (c) => `Barbier ${c.last}`,
    (c) => `Studio ${c.first}`,
    (c) => `Les Ciseaux ${de(c.first)}`,
  ],
  bakery: [
    (c) => `Boulangerie Maison ${c.last}`,
    (c) => `Aux Délices ${de(c.first)}`,
    (c) => `Le Fournil du ${c.place}`,
    (c) => `Boulangerie ${c.last}`,
    (c) => `Au Pain ${de(c.first)}`,
    (c) => `La Mie ${de(c.first)}`,
  ],
  plumber: [
    (c) => `Plomberie ${c.last} & Fils`,
    (c) => `${c.last} Plomberie Chauffage`,
    (c) => `Plomberie du ${c.place}`,
    (c) => `Dépann'Eau ${c.last}`,
    (c) => `Sanitaire ${c.last}`,
  ],
  beauty: [
    (c) => `Institut ${c.first}`,
    (c) => `L'Instant Beauté ${de(c.first)}`,
    (c) => `Beauté du ${c.place}`,
    (c) => `Maison ${c.first} Esthétique`,
    (c) => `Institut Éclat ${c.last}`,
    () => "Institut Douce Heure",
  ],
  florist: [
    (c) => `Au Bouquet ${de(c.first)}`,
    (c) => `L'Atelier Floral ${de(c.first)}`,
    (c) => `Les Fleurs du ${c.place}`,
    (c) => `Maison ${c.last} Fleuriste`,
    (c) => `Pétales & ${c.last}`,
    () => "Fleurs & Compagnie",
  ],
  electrician: [
    (c) => `Élec' Services ${c.last}`,
    (c) => `${c.last} Électricité`,
    (c) => `Électricité du ${c.place}`,
    (c) => `${c.last} Élec`,
    (c) => `Lumière & Courant ${c.last}`,
  ],
};

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function week(...hours: string[]): DayHours[] {
  return DAYS.map((day, index) => ({ day, hours: hours[index] }));
}

const CLOSED = "Fermé";

/** Two believable weeks per trade; the generator picks one. */
export const HOURS: Record<SectorId, DayHours[][]> = {
  garage: [
    week("8 h – 12 h, 14 h – 18 h 30", "8 h – 12 h, 14 h – 18 h 30", "8 h – 12 h, 14 h – 18 h 30", "8 h – 12 h, 14 h – 18 h 30", "8 h – 12 h, 14 h – 18 h", "8 h 30 – 12 h", CLOSED),
    week("8 h 30 – 12 h, 13 h 30 – 18 h", "8 h 30 – 12 h, 13 h 30 – 18 h", "8 h 30 – 12 h, 13 h 30 – 18 h", "8 h 30 – 12 h, 13 h 30 – 18 h", "8 h 30 – 12 h, 13 h 30 – 17 h", CLOSED, CLOSED),
  ],
  restaurant: [
    week(CLOSED, "12 h – 14 h, 19 h – 22 h", "12 h – 14 h, 19 h – 22 h", "12 h – 14 h, 19 h – 22 h", "12 h – 14 h, 19 h – 22 h 30", "12 h – 14 h 30, 19 h – 22 h 30", "12 h – 15 h"),
    week("12 h – 14 h", "12 h – 14 h, 19 h – 21 h 30", "12 h – 14 h, 19 h – 21 h 30", "12 h – 14 h, 19 h – 21 h 30", "12 h – 14 h, 19 h – 22 h 30", "19 h – 22 h 30", CLOSED),
  ],
  hairdresser: [
    week(CLOSED, "9 h – 18 h 30", "9 h – 18 h 30", "9 h – 19 h", "9 h – 19 h", "9 h – 17 h", CLOSED),
    week(CLOSED, "9 h 30 – 19 h", "9 h 30 – 19 h", "9 h 30 – 20 h", "9 h 30 – 19 h", "9 h – 18 h", CLOSED),
  ],
  bakery: [
    week(CLOSED, "6 h 30 – 19 h 30", "6 h 30 – 19 h 30", "6 h 30 – 19 h 30", "6 h 30 – 19 h 30", "7 h – 19 h 30", "7 h – 13 h"),
    week("6 h 30 – 19 h", "6 h 30 – 19 h", CLOSED, "6 h 30 – 19 h", "6 h 30 – 19 h", "7 h – 19 h", "7 h – 12 h 30"),
  ],
  plumber: [
    week("8 h – 18 h", "8 h – 18 h", "8 h – 18 h", "8 h – 18 h", "8 h – 17 h", "Dépannages sur appel", CLOSED),
    week("7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 16 h 30", CLOSED, CLOSED),
  ],
  beauty: [
    week(CLOSED, "9 h 30 – 18 h 30", "9 h 30 – 18 h 30", "9 h 30 – 19 h 30", "9 h 30 – 18 h 30", "9 h – 17 h", CLOSED),
    week("14 h – 19 h", "9 h – 19 h", "9 h – 19 h", "9 h – 20 h", "9 h – 19 h", "9 h – 16 h", CLOSED),
  ],
  florist: [
    week("14 h – 19 h", "9 h – 12 h 30, 14 h – 19 h", "9 h – 12 h 30, 14 h – 19 h", "9 h – 12 h 30, 14 h – 19 h", "9 h – 19 h 30", "9 h – 19 h 30", "9 h – 12 h 30"),
    week(CLOSED, "9 h – 19 h", "9 h – 19 h", "9 h – 19 h", "9 h – 19 h 30", "9 h – 19 h 30", "9 h 30 – 13 h"),
  ],
  electrician: [
    week("8 h – 18 h", "8 h – 18 h", "8 h – 18 h", "8 h – 18 h", "8 h – 17 h", CLOSED, CLOSED),
    week("7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h 30", "7 h 30 – 12 h, 13 h 30 – 17 h", "Urgences sur appel", CLOSED),
  ],
};
