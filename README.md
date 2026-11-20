# Pignon

Pignon est un prototype de SaaS français pour ceux qui vendent des sites web : il scanne une zone, repère les commerces sans site (ou avec un site à l'abandon), prépare leur maquette et aide à décrocher le rendez-vous.

## Un MVP factice

Ce dépôt contient toute l'interface et aucun moteur.

- Les commerces, les avis, les numéros de téléphone et les chiffres sont **inventés**, générés de façon déterministe dans `src/lib/data`.
- Aucun compte n'est créé, aucun mot de passe n'est conservé, aucun paiement n'est effectué. Les abonnements sont simulés.
- L'état vit dans le navigateur (`localStorage`). Le seul appel réseau est celui des tuiles de la carte.
- Toutes les pages demandent aux moteurs de recherche de ne pas les indexer (`robots` dans les deux layouts racine), tant que c'est un prototype.

## Lancer le projet

```bash
npm install
npm run dev
```

Le site est sur http://localhost:3000 et l'application sur http://localhost:3000/app. Au premier lancement, un compte Pro de démonstration est créé ; le menu « Démo » de la barre du haut change de formule et simule des événements.

## Ce qu'il contient

- **Le site** : accueil, tarifs, connexion, inscription, premier lancement.
- **L'application** : Aujourd'hui, radar en 3D, fiche d'un commerce, pipeline, coach d'appel, alertes, territoire, abonnement, réglages.
- **Les maquettes de sites** : quatre directions artistiques sous `/m/<commerce>`, et la page « avant » qui recrée la présence en ligne actuelle du commerce.

## Vérifier

```bash
npm run typecheck
npm run lint
npm test
node scripts/snap.mjs /app/radar
```

La dernière commande capture une page dans Chrome sans tête et liste les erreurs de console. Ses options (mobile, formule, clics, audit d'accessibilité) sont décrites en tête de `scripts/snap.mjs`.

## Pile technique

Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn sur Base UI, Motion, MapLibre GL, zustand, dnd-kit, vitest.

Les règles du projet sont dans `CLAUDE.md`, le guide de design dans `DESIGN.md`, les cahiers des charges par écran dans `docs/briefs` (ils décrivent encore la première direction visuelle, sombre ; ils restent la référence pour les fonctionnalités).

## Crédits

- Méthode de design : [unslop](https://github.com/heydamir/unslop), de Damir Sokolovsky, sous licence CC BY 4.0.
- Cartes : [OpenFreeMap](https://openfreemap.org), [OpenMapTiles](https://openmaptiles.org), données © les contributeurs d'[OpenStreetMap](https://www.openstreetmap.org/copyright).
