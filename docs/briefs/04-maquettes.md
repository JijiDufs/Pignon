# Brief — les maquettes de sites (directions artistiques)

Deux agents se partagent les quatre directions artistiques :
- agent `maquettes-a` : **Atelier** et **Clair** ; captures dans `.snap/maquettes-a/`
- agent `maquettes-b` : **Maison** et **Néon** ; captures dans `.snap/maquettes-b/`

## Ton périmètre

Uniquement les dossiers de tes deux directions : `src/maquettes/<da>/**`. Le fichier `src/maquettes/<da>/index.tsx` existe en provisoire : remplace-le. Il exporte par défaut un composant qui reçoit `MaquetteProps` (`src/maquettes/types.ts`) : `business`, `content`, `da`.

La route `/m/:slug?da=<id>&embed=1`, le registre `src/maquettes/index.ts` et le bandeau « maquette de démonstration » (`chrome.tsx`) existent déjà : n'y touche pas.

## Ce que tu fabriques

C'est le cœur de la promesse de Pignon : un freelance appelle un garagiste et lui dit « je vous ai déjà fait votre site, regardez ». La maquette doit donner au commerçant l'impression que c'est **chez lui**, et au freelance la fierté de la montrer. Ce n'est pas un gabarit générique : c'est un vrai site vitrine d'une page, dessiné avec un parti pris.

Ici tu sors de l'univers Pignon. **Aucun** token, composant ou police de Pignon. Chaque direction artistique est un monde à part, défini dans `DAS` (`@/lib/data`, lis `das.ts`) : palette, polices, ambiance. Les couleurs en dur sont permises et attendues.

| | Parti pris | Polices (Google Fonts) |
|---|---|---|
| **Atelier** | Brut et direct, pour les métiers de la main. Charbon, acier clair, orange de sécurité. Titres condensés très gras, grands chiffres, hachures de chantier, filets épais. | Barlow Condensed, Barlow |
| **Clair** | Net et rassurant, on trouve l'info en trois secondes. Blanc, ardoise, lagon. Beaucoup d'air, une grille stricte, des blocs d'information très lisibles. | Figtree |
| **Maison** | Chaleureux et soigné, comme une devanture repeinte chaque printemps. Lin, vert sapin, jaune beurre, griotte. Sérif généreux, compositions de menu ou d'ardoise, petits ornements dessinés. | Fraunces, Karla |
| **Néon** | Du caractère, pour ceux qu'on reconnaît de loin. Minuit, rose néon, citron, lavande. Titres larges et massifs, bandeaux défilants, contrastes francs. | Unbounded, Sora |

Ces lignes sont un point de départ. À toi de pousser chaque direction jusqu'à ce qu'elle ait une vraie personnalité, différente des trois autres au premier coup d'œil.

## Contenu de la page

Tout vient de `content` (`MaquetteContent`) et `business` : rien d'écrit en dur qui ne marcherait que pour un garage. Le même template doit être juste pour un garage, une boulangerie, un salon de coiffure, un plombier, un fleuriste (huit métiers, `business.sector`).

1. En-tête : nom du commerce (c'est son logo, traité en typographie), ancres vers les sections, bouton d'appel avec le téléphone.
2. Haut de page : `tagline`, `intro`, les deux appels à l'action (`cta`), quelques faits (`facts`).
3. Prestations : `services`, avec les prix quand il y en a.
4. Atouts : `strengths`.
5. À propos : `about`.
6. Avis : la note et le nombre d'avis (`reviewSummary`), et les `sampleReviews` présentés clairement comme des **exemples** (« Exemples d'avis », pas de faux nom de plateforme).
7. Infos pratiques : horaires (`hours`), adresse, téléphone, un emplacement de plan dessiné (pas de carte réelle), un formulaire de contact dont le bouton est inactif et marqué « Formulaire de démonstration ».
8. Pied de page.

**Images.** Aucune image externe, aucune photo. Compose avec la typographie, la couleur, des motifs et des illustrations en SVG écrites à la main (outils, épis, ciseaux, fleurs). Là où un vrai site aurait une photo, dessine un emplacement assumé et élégant, avec une légende discrète (« Votre atelier, en photo ») : le commerçant doit comprendre que ses photos viendront là, pas croire que la page est cassée.

## Contraintes techniques

- Composants serveur par défaut. Un îlot client (`"use client"`) seulement pour une interaction (menu mobile). Ces pages sont prérendues : relis les règles Next de `CLAUDE.md` (rien d'aléatoire, pas d'horloge pendant le rendu).
- Polices via `next/font/google`, déclarées dans ton dossier, avec `display: "swap"` et `preload: false`, exposées en variables CSS sur l'élément racine de ton template.
- Le template définit lui-même son fond, sa couleur de texte et sa police sur son élément racine (`min-height: 100vh`). Il ne suppose rien du `body`.
- Tailwind est disponible (valeurs arbitraires, variables CSS). Pas de dépendance nouvelle. `lucide-react` est permis pour de petites icônes.
- Mouvement : sobre, en CSS, au service du caractère de la direction (un bandeau défilant pour Néon a du sens). `prefers-reduced-motion` respecté.
- La maquette s'affiche le plus souvent dans une iframe à 1280 × 800 ou 390 × 780, réduite à l'écran : les titres doivent rester lisibles en petit, le premier écran doit être fort.
- Accessibilité : titres dans l'ordre, contrastes AA, liens et boutons au clavier, `lang="fr"` vient du layout.

## Trouver des commerces d'essai

La page `/m` (http://localhost:3000/m) liste deux commerces par métier avec leurs liens. `curl -s localhost:3000/m | grep -o 'data-slug="[^"]*"'` donne les slugs.

## À vérifier avant de rendre

Pour **chacune** de tes deux directions :
- capture pleine page bureau (`--full`) et mobile (`--mobile --full`) pour au moins quatre métiers différents, dont un garage, une boulangerie et un salon de coiffure ;
- le premier écran à 1280 × 800 et à 390 × 780 : est-ce qu'on a envie de le montrer ?
- aucun débordement horizontal sur mobile, aucun texte coupé avec un nom de commerce long ;
- aucune erreur de console.

Mets les deux directions côte à côte : si elles se ressemblent, l'une des deux n'est pas allée assez loin.
