# Brief — les alertes et le territoire

Nom d'agent : `alertes`. Captures dans `.snap/alertes/`.

## Ton périmètre

- `src/app/(pignon)/app/alertes/page.tsx`
- `src/app/(pignon)/app/territoire/page.tsx`
- `src/components/alertes/**`, `src/components/territoire/**`

Remplace les deux fichiers provisoires.

## Écran 1 : les alertes (`/app/alertes`)

Les alertes sont ce qui fait revenir l'abonné chaque matin. Quatre sortes (`alerts` du store, champ `kind`) :
- `mockup-opened` : un commerçant regarde sa maquette. La plus précieuse.
- `new-business` : une entreprise vient de s'immatriculer dans la zone.
- `reservation-ending` : une réservation se termine bientôt.
- `meeting-soon` : un rendez-vous approche.

Contenu :
- **Le fil**, groupé par jour (aujourd'hui, hier, cette semaine, plus tôt), du plus récent au plus ancien. Chaque sorte a sa mise en forme propre, pas la même carte quatre fois :
  - maquette ouverte : `BusinessMark`, nom, depuis combien de temps (`useNow`), une vignette de la maquette, l'action « Rappeler maintenant » (vers `/app/coach?commerce=:id`) ;
  - nouvelle entreprise : présentée comme un extrait de registre (nom, métier, rue, date d'immatriculation, forme juridique, via `getNewRegistrations` et `registrationId`), action « Ouvrir la fiche » si un commerce lui correspond (`businessId`) ;
  - réservation : jusqu'à quand, action « Appeler » ou « Libérer » (`release`) ;
  - rendez-vous : quand et où, action « Voir la fiche ».
- Les non lues se distinguent nettement. On marque une alerte comme lue en l'ouvrant, et il y a « Tout marquer comme lu » (`markAlertRead`, `markAllAlertsRead`).
- Des filtres par sorte, avec le nombre de chacune.
- **Moment signature : l'alerte qui arrive.** Quand une alerte s'ajoute pendant qu'on est sur l'écran (menu « Démo » de la barre du haut, ou une vraie ouverture de maquette dans un autre onglet), elle entre en tête du fil avec un allumage et pousse les autres (`layout`). Une maquette ouverte il y a moins de dix minutes garde un témoin « en direct » qui pulse.
- **Sur le côté** (ou dessous sur mobile) :
  - « Maquettes ouvertes » : pour chaque maquette envoyée (`shared`), combien de fois elle a été ouverte et quand (`opens`), triées par ouverture la plus récente. Celles jamais ouvertes sont là aussi : c'est une information.
  - « Nouvelles entreprises de ta zone » : la liste de `getNewRegistrations(zone.cityId)`.
  - Un raccourci vers les réglages de notification (`/app/reglages`).

Formules : `open-alert` et `new-business-alerts` sont réservées à Pro. En dessous, les blocs correspondants sont sous `PlanGate` avec leur vrai contenu flouté derrière, et le fil ne montre que les alertes permises. Aucune alerte : un état vide qui explique quand elles arriveront.

## Écran 2 : le territoire (`/app/territoire`, formule Agence, `territory`)

L'exclusivité est la promesse la plus forte de Pignon : **un métier dans une ville, pour une seule agence.** Cet écran la rend concrète.

- **La grille des territoires** : les huit métiers (`SECTORS`) en lignes, des villes en colonnes (la ville de la zone d'abord, puis d'autres de `CITIES` ; une recherche ou un sélecteur permet d'en ajouter). Chaque case est un territoire, dans l'un de trois états :
  - **libre** : on peut le prendre. La case montre ce qu'il vaut : nombre d'opportunités et chiffre d'affaires potentiel (`getZoneStats(cityId, { sectors: [sector] })`) ;
  - **à toi** (`territories` du store, clé `territoryKey(cityId, sector)`) : allumé ;
  - **pris par une autre agence** (`territoryTakenBy(cityId, sector)`) : verrouillé, avec le nom de l'agence.
- **Le compteur** : « 2 territoires sur 5 » (`getPlan(plan).limits.territories`).
- **Moment signature : prendre un territoire.** Au clic sur une case libre, un panneau détaille le territoire sur la carte (`PignonMap` centrée sur la ville, avec les commerces de ce métier en épingles). Le bouton « Prendre ce territoire » appelle `claimTerritory`. S'il renvoie vrai : la case s'allume dans la grille, et sur la carte toutes les épingles du métier s'allument en cascade. On peut le rendre (`releaseTerritory`).
- Limite atteinte : le bouton l'explique au lieu d'échouer en silence.
- Une phrase claire explique ce que l'exclusivité change : les commerces de ce métier dans cette ville ne sont plus proposés aux autres abonnés tant que le territoire est tenu.

Formules : en dessous d'Agence, tout l'écran est sous `PlanGate feature="territory"`, avec la vraie grille visible derrière le verrou. C'est l'argument de vente de la formule Agence : l'aperçu doit donner envie.

Mobile : la grille devient une liste par ville, les métiers en lignes.

## À vérifier avant de rendre

- `/app/alertes` : compte de démo, formule Solo (blocs verrouillés), compte sans alerte (`--state '{"alerts":[]}'`), mobile.
- `/app/territoire` : formule Agence (`--plan agency`), avec un territoire pris (`--state '{"territories":["villeurbanne:garage"]}'` ajouté à `--plan agency`), formule Pro (verrou), mobile.
- La grille au clavier (flèches ou tabulation), chaque case avec un nom accessible complet (« Garages à Villeurbanne, libre, 11 opportunités »).
