# Pignon — guide de design

À lire avant de dessiner un écran. Ce guide vaut pour le site et l'application Pignon.
Les maquettes de sites pour les commerçants (`src/maquettes`) sont un autre monde (section 9).

La méthode est celle d'**unslop**, de Damir Sokolovsky ([@heydamir](https://x.com/heydamir), [heydamir/unslop](https://github.com/heydamir/unslop), CC BY 4.0) : un habillage neutre et calme, et toute la richesse concentrée dans un ou deux moments de contenu.

## 1. La direction

- **Produit.** Pignon montre à ceux qui créent des sites web les commerces de leur ville qui n'en ont pas, et prépare la maquette qui décroche le rendez-vous.
- **Caractère.** Précis, lumineux, cartographique.
- **Univers.** La maquette blanche d'architecte, le plan-relief de Lille : une ville en volumes blancs où seul ce qui compte prend la couleur.
- **Moments.** (1) La ville en 3D : les opportunités montent en colonnes vermillon pendant le scan, la caméra plonge sur le commerce choisi. (2) La maquette du site, posée en perspective comme un objet qu'on peut prendre en main.
- **Signature.** La cote d'architecte : les petits chiffres (distance, score, compteur) en chasse fixe. Et le pignon, forme de la marque.

Le client a demandé une interface claire, fluide, avec du relief et des zooms au clic. Ces effets vivent dans les deux moments ci-dessus, jamais dans l'habillage.
La ville en 3D revient partout où elle a un sens : accueil, connexion, premier lancement, « Aujourd'hui » (la caméra se pose devant le commerce à rappeler), radar, fiche, territoire.

## 2. Couleurs

Tokens dans `src/app/(pignon)/globals.css`. Les noms datent de la première version (bleu nuit) : lis-les comme des rôles.

| Token | Valeur | Rôle |
|---|---|---|
| `nuit-950` | #FFFFFF | Barre latérale, texte posé sur une couleur pleine |
| `nuit-900` | #FAFAFA | Fond des pages |
| `nuit-800` | #FFFFFF | Cartes, feuilles |
| `nuit-700` | #F4F4F5 | Survol, élément actif, creux |
| `nuit-600` | #E9E9EB | Pistes de jauges, sélection |
| `nuit-500` | #D4D4D8 | Bordures fortes |
| `craie` / `brume` / `pave` | #171717 / #525252 / #6B6B6B | Texte principal, secondaire, discret |
| `lumiere` | #D9391A | **L'accent** : vermillon de brique. Sélection, chiffre clé, repère d'alerte |
| `lumiere-doux`, `-fort`, `-pale` | | Variantes plus sombres pour le texte, teinte pâle pour un fond |
| `heat-hot` à `heat-cold` | | Chaleur d'une opportunité : une seule teinte, du gris au vermillon. Des marques, jamais du texte |
| `enseigne`, `pharmacie`, `lune`, `lilas`, `paille`, `ambre` | | Sens uniquement (erreur, réussite, information…), en petites touches |
| `trait`, `trait-fort` | encre à 8 % et 16 % | Filets |

Règles :
- Les surfaces restent neutres. Un écran dont le fond paraît coloré est allé trop loin.
- **L'action principale est en encre** (bouton noir, texte blanc). L'accent est réservé à la sélection, au chiffre qui compte et aux volumes de la carte : quelques pour cent de l'écran.
- Trois rôles de texte, pas plus. Jamais de texte dans une couleur de chaleur.
- Pas de dégradé d'une teinte à une autre, pas de lueur ni d'ombre colorée, pas de texte en dégradé.
- Ombres neutres et douces : `shadow-petit`, `shadow-flottant` (ce qui flotte), `halo` (l'élément en avant).

## 3. Typographie

- **Geist** pour toute l'interface, **Geist Mono** pour les chiffres et les cotes (classe `cote`).
- Graisses 400 et 500, 600 au plus et rarement. La hiérarchie vient de la taille et de la couleur.
- `enseigne` : grands titres (500, interlettrage serré, à partir de 40 px). `titre` : titres de section. `voix` : ce qui se dit à voix haute, composé plus grand.
- Majuscule au premier mot seulement. Pas de libellé en capitales espacées, pas d'italique d'emphase, pas d'interlettrage négatif sur du petit texte.
- Chiffres tabulaires, un seul format par écran (`src/lib/format.ts`).

## 4. Espace et formes

- Grille de 4 px. Même chose, même taille. L'espace montre les groupes.
- Rayons emboîtés : contrôles 8 à 10, cartes 12 à 16, panneaux 16 à 24. Tout n'est pas une pilule.
- On sépare par le vide et les filets. Pas de mur de cartes identiques : varie selon le contenu.
- Sur la carte, les panneaux sont des feuilles flottantes presque opaques (classe `feuille`).
- Icônes lucide, 16 px, trait fin, couleur du texte discret. Aucune icône décorative.

## 5. Mouvement

Une seule courbe (`cubic-bezier(0.22, 1, 0.36, 1)`), trois durées (`vif` 160 ms, `souple` 420 ms, `rebond` 600 ms) dans `src/lib/motion.ts`.

- Le mouvement **explique** : d'où vient un panneau, vers quel commerce va la caméra, quel chiffre a changé.
- Les grands mouvements appartiennent aux deux moments : la caméra de la carte (plongeon au clic, lente rotation pendant le scan), les colonnes qui montent, l'objet qui vient vers soi quand on clique sur la maquette.
- Ailleurs : un survol change une couleur, un appui enfonce de 2 %, un menu monte de quelques pixels, un nombre compte vers sa nouvelle valeur.
- Interdits : boucles décoratives, rebonds, cartes qui se soulèvent au survol, apparition de chaque bloc au défilement.
- Mouvement réduit respecté partout.

## 6. Voix

- On tutoie l'utilisateur. Dans les scripts, le freelance vouvoie le commerçant.
- Phrases courtes, concrètes, chiffrées. Un bouton dit ce qu'il fait. Pas de point d'exclamation, pas de point final sur un libellé court, pas de formule creuse.
- Lexique : commerce, fiche, opportunité, score, maquette, direction artistique, réserver, pipeline, formule, zone, scan.

## 7. Composants partagés

`src/components/pignon` : `Logo`, `PignonMark`, `BusinessMark`, `SectorIcon`, `ScoreDial`, `ScorePill`, `HeatLabel` (`HEAT_COLOR`, `HEAT_HEX`), `SiteStatusBadge`, `PlanGate`, `LockChip`, `PlanBadge`, `Page`, `PageHeader`, `Panel`, `AnimatedNumber`, `Allumage`, `MaquetteFrame`, `MaquetteStage` (la maquette en perspective, qui vient vers soi au clic), `EmptyState`, `LinkButton`, `Kbd`.
La carte : `PignonMap`, `MapMarker`, `MapCircle` (`pignon-map.tsx`) et les calques de la scène 3D `MapBeacons`, `MapBeam`, `MapDots` (`map-layers.tsx`).
`src/components/ui` : shadcn sur Base UI. `src/components/site` : en-tête et pied des pages publiques.

## 8. Accessibilité et abonnements

- Contraste AA, focus visible (contour encre), tout au clavier, un seul `<h1>` par page, cibles de 36 px au moins. Les colonnes de la carte se cliquent ; la liste à côté est leur équivalent au clavier.
- Formules : Découverte, Solo, Pro, Agence (`src/lib/plans.ts`). `useCan`, `PlanGate` (contenu flouté sous un verrou), `LockChip`, `promptUpgrade`. Un verrou montre toujours ce qu'il y a derrière.

## 9. Les maquettes de sites (hors Pignon)

Les pages sous `/m/...` sont des sites de commerçants : aucun token, police ni composant de Pignon. Quatre directions artistiques (Atelier, Maison, Clair, Néon), chacune avec sa palette, ses polices et son caractère (`DAS` dans `@/lib/data`).
