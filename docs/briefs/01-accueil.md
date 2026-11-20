# Brief — la page d'accueil

Nom d'agent : `accueil`. Captures dans `.snap/accueil/`.

## Ton périmètre

- `src/app/(pignon)/page.tsx` (remplace le fichier provisoire)
- `src/components/landing/**`

La page est **prérendue** (hors `/app`) : relis les règles Next de `CLAUDE.md`. Elle utilise `SiteHeader` et `SiteFooter` (`@/components/site`). La page `/tarifs` appartient à un autre agent : fais-y simplement des liens.

## Rôle de la page

Faire comprendre Pignon en cinq secondes à quelqu'un qui vend des sites web (freelance, petite agence, débutant qui construit avec des outils d'IA), et lui donner envie de créer un compte. Appel principal : « Essayer gratuitement » vers `/inscription`. Appel secondaire : « Voir la démo » vers `/app`.

Le positionnement : **les autres vendent une liste, Pignon mène au rendez-vous.** Trois différences à démontrer, pas à affirmer :
1. la maquette du site est prête avant l'appel, et on sait quand le commerçant l'ouvre ;
2. un commerce réservé disparaît pour les autres abonnés pendant 30 jours ;
3. le score explique pourquoi ce commerce, maintenant.

## Moment signature : la rue qui s'allume

Le haut de page n'est ni un gros chiffre ni une capture d'écran : c'est une **rue commerçante à l'heure bleue**, dessinée en SVG dans le code. Une rangée de façades à pignon, vitrines éteintes, ciel qui passe du bleu profond à une lueur d'horizon.

- Un champ « Ta ville » (propositions parmi `CITIES`) et un bouton « Compter les vitrines éteintes ».
- Au chargement, la scène se joue une fois pour Villeurbanne ; elle rejoue à chaque ville choisie. Un faisceau balaie la rue, les vitrines des commerces sans site s'allument une à une (l'allumage de `DESIGN.md`), un compteur monte jusqu'au nombre réel d'opportunités de la ville (`getZoneStats(cityId).opportunities`) et affiche le chiffre d'affaires potentiel.
- Chaque façade peut porter l'icône d'un métier (`SectorIcon`). Au survol ou au focus d'une vitrine allumée, une petite étiquette dit le statut (« Aucun site », « Site mort »).
- Rien d'aléatoire pendant le rendu : l'ordre d'allumage vient des données. Mouvement réduit : la rue apparaît déjà allumée, compteur à sa valeur finale.

C'est la seule grande animation automatique de la page. Tout le reste répond au visiteur.

## Les sections

Chacune a sa propre composition. Pas de série de cartes identiques.

1. **Le haut de page** (ci-dessus), avec un titre fort et les deux appels à l'action.
2. **La liste contre le rendez-vous.** Le constat : la même liste vendue à tout le monde, le garagiste appelé dix fois. À montrer par un contraste visuel (un tableau terne et anonyme d'un côté, une fiche Pignon vivante de l'autre), pas par un paragraphe.
3. **La maquette avant l'appel.** Une vraie `MaquetteFrame` (bureau et mobile) d'un commerce brûlant de Villeurbanne, avec des pastilles pour changer de direction artistique en direct (`DAS`). À côté, la notification « regarde sa maquette » qui arrive quand on clique sur un bouton « Simuler l'ouverture ».
4. **Le commerce réservé.** Une courte liste de commerces où l'un se verrouille sous les yeux du visiteur quand il clique « Réserver » : pour lui il s'allume, pour « les autres abonnés » (seconde colonne en miroir) il se grise.
5. **Le score qui explique.** Un `ScoreDial` et ses raisons réelles (`business.reasons`), avec leurs points qui s'additionnent.
6. **L'appel.** Un extrait du script (`buildCallScript`), mis en page comme un texte de théâtre en `voix`. Le visiteur clique sur une objection (« J'ai déjà une page Facebook ») et la réponse se déplie.
7. **Comment ça marche** (`id="fonctionnement"`) : quatre vraies étapes dans l'ordre, scanner, choisir, appeler, signer. Ici les numéros sont légitimes.
8. **Les formules en bref** : les quatre formules de `PLANS` avec leur prix et une ligne chacune, et un lien « Comparer les formules » vers `/tarifs`.
9. **Questions** (`id="questions"`, accordéon) : d'où viennent les données (registre public des entreprises et analyse de leur présence en ligne), ce que voit le commerçant (une maquette marquée « démonstration », jamais indexée), plusieurs abonnés peuvent-ils appeler le même commerce (non, grâce à la réservation), faut-il savoir coder, peut-on arrêter quand on veut.
10. **Dernier appel à l'action**, puis le pied de page.

## Textes

Tu écris tous les textes. Ton direct, concret, tutoiement. Le titre principal peut jouer sur l'image de la vitrine qu'on allume. Aucun chiffre inventé sur les résultats des clients, aucun faux témoignage, aucun logo de client.

## À vérifier avant de rendre

- Capture pleine page bureau et mobile (`--full`, `--mobile`), et le haut de page après le changement de ville.
- Aucune erreur de console, aucun décalage de mise en page au chargement des polices.
- Navigation au clavier de bout en bout : champ ville, pastilles, accordéon.
- La page reste lisible et belle sans JavaScript d'animation (mouvement réduit).
