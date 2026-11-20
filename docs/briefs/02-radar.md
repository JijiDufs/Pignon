# Brief — le radar

Nom d'agent : `radar`. Captures dans `.snap/radar/`.

## Ton périmètre

- `src/app/(pignon)/app/radar/page.tsx` (remplace le fichier provisoire)
- `src/components/radar/**`

## Rôle de l'écran

C'est le cœur du produit : l'abonné choisit une zone et des métiers, lance un scan, et voit les commerces sans site apparaître sur la carte. De là il ouvre une fiche.

La carte est fournie : `PignonMap`, `MapMarker`, `useMap` (`@/components/pignon/pignon-map`), aides `metersPerPixel` et `boundsAround` (`@/lib/map-style`). Lis ces fichiers. La carte occupe tout l'écran sous la barre du haut (la page n'utilise pas le gabarit `Page` : elle remplit `main` en hauteur).

## Moment signature : le scan

Au clic sur « Scanner la zone » :
- un faisceau de radar part du nord et tourne dans le sens horaire autour du centre de la ville, sur le rayon de la zone (un cercle en donne la limite) ;
- quand le faisceau passe sur le cap d'un commerce (`business.bearing`), son épingle s'allume sur la carte (allumage, léger rebond) et il entre dans la liste ; les commerces dont le site est correct apparaissent aussi, mais comme de simples points sombres : le scan les a vus, ce ne sont pas des opportunités ;
- un compteur monte en direct, une ligne discrète dit ce qui est analysé (« garage-ferreira.fr, copyright 2014 »), dans une zone `aria-live="polite"` ;
- en trois à quatre secondes c'est fini : un bilan s'affiche (« 62 opportunités sur 81 commerces, 94 000 € de sites à vendre ») et la liste se trie par score. Appelle `markScanned()`.

Le faisceau doit rester calé sur la carte si elle bouge (ou bien fige la carte le temps du scan). Mouvement réduit : pas de faisceau, les résultats arrivent d'un coup.

Un compte déjà scanné (`lastScanAt` non nul) arrive directement sur les résultats. `?scan=1` dans l'adresse relance un scan à l'arrivée. Un compte neuf arrive sur la carte vide avec une invitation claire à lancer son premier scan.

## Contenu

- **La zone** : ville (parmi `CITIES`), rayon (2 à 10 km, le cercle suit en direct), métiers (pastilles à cocher). Changer de ville déplace la carte (`flyTo` ou `fitBounds`) et appelle `setZone`. Les données : `getBusinesses(cityId)` filtrés par rayon et métiers.
- **Les épingles** : un pignon coloré par la chaleur (`PignonMark`, `HEAT_COLOR`), plus grand pour les brûlants. L'épingle sélectionnée est pleinement allumée, au-dessus des autres, avec le nom du commerce. Un commerce que j'ai réservé porte un petit cadenas Lumière.
- **La liste** (panneau flottant sur la carte, côté gauche) : pour chaque opportunité, `BusinessMark`, nom, métier, distance, `ScorePill`, `SiteStatusBadge`. Filtres par statut de site et par chaleur, tri par score ou par distance. Survoler une ligne met son épingle en avant ; cliquer une épingle sélectionne la ligne et la fait défiler dans la vue.
- **L'aperçu** du commerce sélectionné : ses deux raisons les plus fortes, sa valeur estimée, et le bouton « Ouvrir la fiche », qui appelle `unlock(id)` puis navigue vers `/app/commerces/:id` seulement si `unlock` renvoie vrai.
- **Les commerces pris par d'autres** : `takenByOthers(id)` (`@/lib/exclusivity`). Ils restent visibles mais verrouillés, grisés, avec « Réservé par un autre abonné jusqu'au 4 décembre ». Impossible de les ouvrir. C'est la démonstration de l'exclusivité : traite-la avec soin.
- Un filtre « Créés depuis moins de 6 mois » (`isNew`), réservé à la formule Pro (`new-business-alerts`, avec `LockChip`).

## Formules

- Découverte : les noms sont masqués (`useIsMasked`, `maskName`), ni adresse ni téléphone. L'aperçu dit combien de fiches il reste ce mois-ci (`useQuota`) avant d'ouvrir. Quota épuisé : `unlock` ouvre lui-même le dialogue de passage à la formule supérieure.
- Solo et plus : noms visibles.

## Mobile

La carte en haut, la liste en dessous dans un panneau qu'on peut agrandir, ou une bascule « Carte / Liste ». Les contrôles de zone tiennent dans un panneau repliable.

## À vérifier avant de rendre

- Le scan filmé en plusieurs captures (`--click "text=Scanner la zone" --wait 800`, puis 2000, puis 4500).
- Résultats avec un commerce sélectionné, un commerce pris par un autre abonné visible, formule Découverte (`--plan free`), compte neuf (`--state '{"lastScanAt":null,"unlocked":[]}'`), mobile.
- La liste et les épingles au clavier.
- Aucune erreur de console ; la carte ne clignote pas quand on filtre.
