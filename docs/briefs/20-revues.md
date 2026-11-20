# Brief — l'équipe de revue

Les écrans sont construits. Tu fais partie de l'équipe qui les passe au crible avant de les montrer au client. Lis `CLAUDE.md`, `DESIGN.md` et `docs/briefs/00-commun.md`, puis la section de ton rôle ci-dessous. Les cahiers des charges de chaque écran sont dans `docs/briefs/01` à `10` : c'est la référence de ce qui était demandé.

## Règles communes

- **Tu ne modifies pas le code des écrans.** Tu observes, tu mesures, tu rapportes. Les équipes qui ont construit chaque écran corrigeront à partir de ton rapport. (Exception : le rôle « tests » écrit des fichiers de test, dans ses propres dossiers.)
- Tu regardes le produit **en vrai** : `node scripts/snap.mjs` (options en tête du fichier, dont `--axe`, `--plan`, `--state`, `--click`, `--press`, `--mobile`, `--full`, `--h`). Range tes captures dans `.snap/<ton-rôle>/`. Le serveur de dev tourne sur http://localhost:3000 ; n'en lance pas d'autre.
- Les routes : `/`, `/tarifs`, `/connexion`, `/inscription`, `/bienvenue`, `/app`, `/app/radar`, `/app/commerces/:id`, `/app/pipeline`, `/app/coach`, `/app/alertes`, `/app/territoire`, `/app/abonnement`, `/app/reglages`, `/m` (galerie), `/m/:slug?da=atelier|clair|maison|neon`, `/m/:slug/avant`. Des identifiants de commerces se lisent dans la page `/m` (`data-slug`) et dans `/app/radar`.
- Les états à couvrir : compte de démo Pro (par défaut), formules Découverte, Solo et Agence (`--plan`), compte neuf, mobile 390, bureau 1440.
- **Ton rapport** : une liste de constats classés **bloquant** (cassé, illisible, trompeur), **important** (nuit clairement à la qualité) ou **finition**. Pour chaque constat : l'écran et l'état, ce que tu observes (avec le chemin de la capture), le fichier concerné si tu l'as identifié, et la correction que tu proposes, précise. Regroupe par écran, dans cet ordre : accueil, tarifs, inscription, radar, fiche, pipeline et aujourd'hui, coach, alertes et territoire, abonnement et réglages, maquettes, page avant, coque de l'app. Termine par les trois choses les plus réussies : on veut aussi savoir ce qu'il ne faut pas abîmer.
- Sois exigeant et concret. « Manque de hiérarchie » ne sert à rien ; « le titre de la colonne et le nom du commerce ont le même poids, passe le titre en 13 px brume » sert.

## Rôle « direction artistique »

Tu es le directeur artistique. Ta référence est `DESIGN.md`, et ta question : est-ce que chaque écran est beau, reconnaissable comme du Pignon, et est-ce que l'ensemble forme un seul produit ?

- Capture chaque écran dans ses états principaux et regarde-les côte à côte.
- Par écran : hiérarchie, composition, usage de la couleur (la Lumière est-elle rare ? un seul élément allumé ?), typographie (les deux voix sont-elles respectées ?), espacements, rayons, densité, alignements.
- Les tics interdits de `DESIGN.md` (section 3) et du brief commun : relève chaque occurrence.
- Le moment signature de chaque écran existe-t-il, est-il réussi, est-il le seul grand mouvement ? Capture-le à plusieurs instants (`--wait`).
- La cohérence entre écrans : mêmes en-têtes de page, mêmes boutons pour les mêmes gestes, mêmes états vides, mêmes verrous d'abonnement, même vocabulaire visuel pour un commerce (son pignon, son score, son statut) partout.
- Les quatre directions artistiques des maquettes : sont-elles vraiment quatre mondes ? Chacune tient-elle sur plusieurs métiers ?
- Mobile : rien de cassé, rien de serré, des cibles assez grandes.

## Rôle « accessibilité »

Référence : WCAG 2.1 niveau AA.

- Lance `--axe` sur chaque route et chaque état important (dialogues ouverts compris, avec `--click`). Rapporte les violations en les dédoublonnant.
- Parcours au clavier (`--press Tab`, `--press Enter`, etc., et lecture du code) : ordre de tabulation, focus visible, pièges à focus, dialogues et menus (ouverture, fermeture à Échap, retour du focus), glisser-déposer du pipeline, curseur avant / après, grille des territoires, prompteur du coach.
- Noms accessibles des boutons sans texte, des liens, des champs ; titres (un seul `h1`, ordre des niveaux) ; régions et repères ; annonces en direct (scan, alertes, résultats).
- Contrastes : le texte `pave` sur surfaces claires, le texte sur Lumière, les états désactivés, les contenus sous verrou.
- Mouvement réduit (`--reduced`) : chaque moment signature a-t-il un état final propre ?
- Zoom à 200 % et largeur 320 : rien de coupé (capture avec `--w 320`).

## Rôle « tests »

Tu es le testeur. Tu cherches ce qui casse.

- **Parcours de bout en bout**, écrits comme scripts Playwright dans `scripts/qa/*.mjs` (utilise `playwright-core` avec `channel: "chrome"`, comme `scripts/snap.mjs`). Chaque script enchaîne un parcours, vérifie des faits à l'écran et sort en erreur s'il échoue :
  1. inscription, premier lancement, premier scan, ouverture d'une fiche ;
  2. Découverte : ouvrir des fiches jusqu'à épuiser le quota, voir le verrou, passer à Pro par le paiement factice, vérifier que tout se débloque ;
  3. fiche : changer de direction artistique, copier le prompt, réserver, partager la maquette ;
  4. ouverture de maquette dans un second onglet du même navigateur, et arrivée de l'alerte dans l'app ;
  5. pipeline : déplacer un commerce jusqu'à « Signé » (menu « Déplacer vers ») et vérifier le total ;
  6. coach : dérouler un appel et enregistrer une issue ; une partie de simulateur jusqu'au débrief ;
  7. territoire : prendre puis rendre un territoire en formule Agence.
  Ajoute `"qa": "for f in scripts/qa/*.mjs; do node $f || exit 1; done"` dans ton rapport comme script npm proposé (ne modifie pas `package.json`).
- **Erreurs de console** : chaque route, chaque formule, mobile et bureau. Zéro erreur, zéro avertissement d'hydratation, zéro requête en échec.
- **Tests unitaires** (vitest, `npm test`) pour la logique partagée, dans de nouveaux fichiers `src/lib/*.test.ts` : formules et droits (`plans.ts`), exclusivité (`exclusivity.ts`), formats (`format.ts`), et les actions du store les plus risquées (quota de fiches, réservation, passage de formule, étapes du pipeline, issue d'un appel).
- **Cas limites** : identifiant de commerce inconnu, slug de maquette inconnu, zone sans aucun métier coché, rayon minimal, stockage local corrompu (`localStorage` contenant un JSON invalide sous la clé `pignon-demo`), rechargement en plein parcours, bouton retour du navigateur.
- Rapporte chaque défaut avec les étapes pour le reproduire.

## Rôle « code »

Tu relis le code comme avant une mise en production.

- `npm run typecheck`, `npx eslint src scripts`, `npm test` : zéro erreur. Puis `npm run build` (tu es le seul autorisé à le lancer, une seule fois à la fois) : chaque erreur ou avertissement de prérendu est un constat, avec la correction que propose Next.
- Règles de `CLAUDE.md` : aucun `window`, horloge ou hasard pendant le rendu hors de `/app` ; `"use client"` seulement où il faut ; aucun appel réseau autre que les tuiles de carte ; aucune dépendance ajoutée ; aucun fichier partagé modifié par une équipe d'écran.
- Défauts de correction : états dérivés mal synchronisés, effets sans nettoyage (minuteurs, écouteurs, observateurs), sélecteurs du store qui recréent un objet à chaque rendu, clés de liste instables, courses dans les animations.
- Performance : `maplibre-gl` chargé seulement sur les écrans à carte, nombre d'iframes de maquettes montées en même temps, listes longues, animations qui ne touchent que `transform` et `opacity`.
- Duplication entre équipes : relève les composants réinventés plusieurs fois (cercles de zone, cartes de commerce, sélecteurs de ville) et dis lequel garder.
- Sécurité et probité du prototype : aucun champ de carte bancaire, mot de passe jamais stocké, adresses de sites inventées jamais cliquables, maquettes non indexées et marquées comme démonstration.

## Rôle « textes »

Tu relis chaque mot visible. Référence : `DESIGN.md`, section 6.

- Lis tous les textes dans le code des écrans et dans `src/lib/data` (scripts d'appel, contenus des maquettes, prompts).
- Fautes, accords, typographie française (espaces avant les signes doubles, guillemets, apostrophes), majuscules abusives.
- Ton : tutoiement de l'utilisateur partout dans l'app, vouvoiement du commerçant dans les scripts. Pas de formule creuse, pas d'exagération, pas d'anglicisme évitable.
- Cohérence du lexique : un même geste porte le même nom sur tous les écrans (réserver, ouvrir la fiche, scanner, formule). Relève chaque divergence, et dis quel terme garder.
- Les boutons disent-ils ce qu'ils font ? Les états vides et les messages d'erreur disent-ils quoi faire ?
- Les tics de rédaction générée : points médians en série, tirets longs utilisés comme séparateurs, phrases de transition vides, triades systématiques.
- Donne pour chaque constat le texte actuel, le fichier, et le texte de remplacement.
