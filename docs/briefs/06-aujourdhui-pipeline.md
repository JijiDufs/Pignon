# Brief — « Aujourd'hui » et le pipeline

Nom d'agent : `pipeline`. Captures dans `.snap/pipeline/`.

## Ton périmètre

- `src/app/(pignon)/app/page.tsx` (l'écran « Aujourd'hui »)
- `src/app/(pignon)/app/pipeline/page.tsx`
- `src/components/dashboard/**`, `src/components/pipeline/**`

Remplace les deux fichiers provisoires. Avant de dessiner le moindre graphique, charge le skill `dataviz` s'il est disponible et applique-le avec la palette de `DESIGN.md`.

## Écran 1 : Aujourd'hui (`/app`)

Ce n'est pas un tableau de bord rempli de tuiles de chiffres. C'est la réponse à une question : **qui j'appelle maintenant ?**

- **La file du jour** (le cœur de l'écran) : une liste ordonnée d'actions, la plus urgente en haut, calculée depuis le store :
  1. un commerçant a ouvert sa maquette récemment (`opens`) : le rappeler tant que c'est chaud ;
  2. un rendez-vous aujourd'hui ou demain (`pipeline`, `meetingAt`) ;
  3. des commerces brûlants réservés et pas encore appelés ;
  4. une réservation qui se termine dans moins de cinq jours (`reservations`).
  Chaque ligne dit pourquoi maintenant, et porte son action (« Appeler » vers `/app/coach?commerce=:id`, « Voir la fiche »).
- **Moment signature** : la première ligne de la file est l'élément allumé de l'écran (un seul `halo`). Si c'est une maquette ouverte il y a moins d'une heure, un témoin « en direct » pulse doucement et le temps écoulé se met à jour (`useNow`). Quand une nouvelle ouverture arrive (menu « Démo » de la barre du haut : « Simuler une maquette ouverte »), la ligne entre en tête de file avec un allumage et pousse les autres (`layout`).
- **Le relevé** : quatre chiffres posés sans boîte, avec `AnimatedNumber` : opportunités dans la zone (`getZoneStats`), chiffre d'affaires potentiel, rendez-vous à venir, chiffre d'affaires signé ce mois-ci.
- **L'entonnoir** du pipeline : combien de commerces à chaque étape, en une seule figure lisible.
- **Les appels de la semaine** (`calls`) : un petit graphique par jour et par issue (rendez-vous, à rappeler, refus, répondeur), avec une légende et des valeurs lisibles.
- **Ta zone** : ville, rayon, métiers, date du dernier scan (`lastScanAt`), lien vers le radar.
- Un mot d'accueil avec le prénom (`user.firstName`) et la date du jour.

Compte neuf (Découverte, tout vide) : l'écran invite à lancer le premier scan, il ne montre pas des zéros partout. Sur Découverte, ce qui dépend du pipeline est montré sous `PlanGate`.

## Écran 2 : le pipeline (`/app/pipeline`)

Un tableau en colonnes, une par étape de `PIPELINE_STAGES` : à appeler, appelé, maquette envoyée, rendez-vous, signé. « Perdu » est à part, replié par défaut.

- **Les cartes** : `BusinessMark`, nom, métier, `ScorePill`, dernière activité (« appelé hier »), et les signaux utiles : cadenas si réservé, œil si la maquette a été ouverte (avec le temps écoulé), date du rendez-vous. Un clic ouvre la fiche.
- **Glisser-déposer** avec `@dnd-kit` (déjà installé) : souris, tactile et clavier (capteur clavier, annonces lues par les lecteurs d'écran en français). Les cartes se réordonnent avec une animation de mise en page. Chaque carte a aussi un menu « Déplacer vers » : le glisser n'est jamais le seul moyen.
- **En tête de colonne** : le nombre de commerces et la valeur potentielle (somme des `estimatedDeal`).
- **Moment signature : signer.** Déposer une carte dans « Signé » ouvre une courte confirmation du montant (prérempli avec `estimatedDeal`, modifiable). À la validation : la carte s'allume (allumage), son pignon passe en plein (`BusinessMark lit`), et le compteur « Signé ce mois-ci » en tête de page monte jusqu'au nouveau total (`AnimatedNumber`). Sobre et net : pas de pluie de confettis.
- **En tête de page** : signé ce mois-ci, taux de transformation (signés sur commerces appelés), filtre par métier, et « Exporter en CSV ». L'export fonctionne vraiment (un fichier généré dans le navigateur avec nom, métier, étape, valeur, téléphone) et il est réservé à la formule Pro (`export`, avec `LockChip` sinon).
- Passer une carte en « Rendez-vous » propose de fixer la date (`meetingAt`).
- **Formules** : sur Découverte, tout le pipeline est sous `PlanGate feature="pipeline"`, avec un aperçu crédible derrière le verrou. Compte neuf sur une formule payante : un état vide qui renvoie au radar.
- **Mobile** : les colonnes défilent horizontalement avec un cran d'arrêt par colonne, et le menu « Déplacer vers » devient le geste principal.

## À vérifier avant de rendre

- `/app` : compte de démo, compte neuf (`--state '{"pipeline":{},"opens":[],"reservations":{},"calls":[],"lastScanAt":null}'`), formule Découverte, mobile.
- `/app/pipeline` : compte de démo, Découverte, mobile, et le moment « signé » (déplace une carte par le menu « Déplacer vers » avec `--click`).
- Le pipeline entièrement au clavier.
- Les graphiques : étiquettes lisibles, couleurs de `DESIGN.md`, jamais la couleur seule pour distinguer deux séries.
