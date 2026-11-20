@AGENTS.md

# Pignon — règles d'équipe

Pignon est un SaaS français pour ceux qui vendent des sites web : il scanne une zone, repère les commerces sans site (ou avec un site à l'agonie), prépare leur maquette et aide à décrocher le rendez-vous.

**Ce dépôt est un MVP factice.** Toute l'interface, aucun backend : pas d'appel réseau (sauf les tuiles de carte), pas de paiement, pas d'authentification. Les données viennent de `@/lib/data` (inventées, déterministes), l'état de `@/lib/store` (localStorage). Les abonnements sont simulés.

## Avant d'écrire une ligne

1. Lis `DESIGN.md` en entier. Le client juge d'abord la beauté et le soin.
2. Lis les composants partagés : `src/components/pignon`, `src/components/ui`, `src/lib`.
3. Next.js 16.4 n'est pas celui de tes souvenirs : lis le guide concerné dans `node_modules/next/dist/docs/` avant d'utiliser une API Next.

## Routes

```
src/app/(pignon)/            site et application (thème clair, globals.css)
  page.tsx                   /            accueil
  tarifs/                    /tarifs
  connexion/, inscription/   /connexion, /inscription
  bienvenue/                 /bienvenue   premier lancement
  app/layout.tsx             coque de l'application (AppGate)
  app/page.tsx               /app         Aujourd'hui
  app/radar/                 /app/radar
  app/commerces/[id]/        /app/commerces/:id   la fiche
  app/pipeline/              /app/pipeline
  app/coach/                 /app/coach
  app/alertes/               /app/alertes
  app/territoire/            /app/territoire
  app/abonnement/            /app/abonnement      lit ?choisir=<formule>
  app/reglages/              /app/reglages
src/app/(maquette)/          sites des commerçants (autre layout racine, aucun style Pignon)
  m/[slug]/                  /m/:slug?da=<id>[&embed=1]
  m/[slug]/avant/            /m/:slug/avant[?embed=1]
src/components/ui/           shadcn (partagé, ne pas modifier)
src/components/pignon/       composants de marque (partagé, ne pas modifier)
src/components/shell/        coque de l'app (partagé, ne pas modifier)
src/components/<écran>/      les composants de chaque écran
src/lib/                     types, données, store, formules, formats, mouvement (partagé)
src/maquettes/               templates de sites par direction artistique
```

## Next.js 16 avec `cacheComponents`

- **Sous `/app`** : `page.tsx` est un fin fichier serveur (`export const instant = false`) qui rend un composant client `XxxScreen` placé dans `src/components/<écran>/`. Tout y est rendu dans le navigateur seulement (voir `AppGate`), donc le store, `Date.now()`, `useSearchParams()` et `localStorage` y sont permis sans précaution.
- **Hors de `/app`** (accueil, tarifs, connexion, inscription, bienvenue, maquettes), les pages sont prérendues. Pendant le rendu : pas de `Date.now()`, `new Date()` sans argument, `Math.random()`, `crypto.randomUUID()`, `window`, `localStorage` ni store. Mets-les dans un `useEffect` ou un gestionnaire d'événement. `useSearchParams()` va dans un composant enfant enveloppé de `<Suspense>`. Les props `params` et `searchParams` d'une page sont des promesses : attends-les dans un composant `async` sous `<Suspense>`.
- Jamais de `window` ou `document` à la racine d'un module. Une bibliothèque réservée au navigateur (`maplibre-gl`) se charge par `import()` dans un `useEffect`.
- Navigation : `next/link` et `useRouter` de `next/navigation`. Aucune image externe.

## Kit d'interface : Base UI, pas Radix

`components/ui` est le shadcn « base-nova », bâti sur `@base-ui/react`. Il n'y a **pas** de `asChild` : on passe l'élément à rendre par `render`.

```tsx
<DialogTrigger render={<Button variant="outline" />}>Ouvrir</DialogTrigger>
<TooltipTrigger render={<button type="button" aria-label="Copier" />}><Copy /></TooltipTrigger>
```

- `Button` : variantes `default` (Lumière), `secondary`, `outline`, `ghost`, `destructive`, `link` ; tailles `xs`, `sm`, `default` (36 px), `lg`, `xl` (grands appels à l'action), `icon`, `icon-sm`, `icon-lg`.
- Un lien à l'allure de bouton : `LinkButton`.
- Notifications : `import { toast } from "sonner"`.
- Fusion de classes : `cn` de `@/lib/utils`.

## Données (`@/lib/data`)

`CITIES`, `SECTORS`, `DAS`, `SITE_STATUS`, `HEAT`, `PIPELINE_STAGES`, `getCity`, `getSector`, `getDa`, `heatOf`, `getBusinesses`, `getOpportunities(cityId, { sectors, radiusKm })`, `getBusiness(id)`, `getBusinessBySlug(slug)`, `searchBusinesses`, `getZoneStats`, `getNewRegistrations`, `getMaquetteContent(business)`, `buildCallScript(business, prénom)`, `buildPrompt(business, da)`. Types dans `@/lib/types`.

Les commerces sont inventés. N'affiche jamais `site.url` comme un lien cliquable.

## État (`@/lib/store`)

`useAppStore(selector)` et ses actions : `setUser`, `setPlan`, `setZone`, `markScanned`, `unlock`, `setStage`, `updatePipelineEntry`, `removeFromPipeline`, `reserve`, `release`, `shareMaquette`, `recordOpen`, `addNewBusinessAlert`, `markAlertRead`, `markAllAlertsRead`, `logCall`, `claimTerritory`, `releaseTerritory`, `setPreference`, `promptUpgrade`, `dismissUpgrade`, `resetDemo`, `startFresh`, `completeOnboarding`.
Sélecteurs : `useCan`, `usePlan`, `useQuota`, `useIsUnlocked`, `useIsMasked`, `useUnreadAlerts`, `useNow` (horloge pour « il y a 12 min »).
Formules : `@/lib/plans` (`PLANS`, `FEATURES`, `getPlan`, `can`, `minPlanFor`, `yearlySaving`).
Sélectionne toujours la tranche la plus fine du store (`useAppStore((s) => s.pipeline)`), jamais l'état entier, et ne crée pas d'objet neuf dans un sélecteur.

Exclusivité simulée (`@/lib/exclusivity`) : `takenByOthers(businessId)` dit si un commerce est déjà réservé par un autre abonné (il s'affiche verrouillé, on ne peut ni l'ouvrir ni le réserver), `territoryTakenBy(cityId, sector)` si un territoire appartient déjà à une autre agence.

Au premier lancement, le store se remplit d'un compte Pro de démonstration. L'inscription repart d'un compte Découverte vide (`startFresh`).

## Vérifier son travail

- Un serveur de dev tourne déjà sur http://localhost:3000. N'en lance pas d'autre, ne lance pas `next build`.
- `npm run typecheck` et `npx eslint <tes dossiers>` : zéro erreur dans tes fichiers (d'autres agents écrivent ailleurs en même temps, leurs erreurs ne te concernent pas).
- **Regarde ton écran.** `node scripts/snap.mjs <route> [options]` capture la page dans Chrome sans tête et liste les erreurs de console ; lis ensuite le PNG avec l'outil Read. Les options sont en tête de `scripts/snap.mjs` (`--mobile`, `--full`, `--plan free`, `--click`, `--select`, `--scroll`, `--h`, `--overflow` pour traquer un débordement horizontal, `--axe` pour l'audit d'accessibilité). Capture, critique comme le ferait un directeur artistique exigeant, corrige, recommence. Avant de rendre : bureau 1440, mobile 390, et chaque formule qui change l'écran.
- Si une valeur modifiée dans `globals.css` ne change pas à l'écran, le serveur de dev sert un CSS périmé : signale-le, il faut le redémarrer après avoir vidé `.next/dev`.
- Un texte `sr-only` placé dans une zone qui défile horizontalement élargit la page s'il n'a pas d'ancêtre positionné : mets `relative` sur le conteneur qui défile.
- N'utilise pas les outils de navigateur partagés (`mcp__Claude_Browser__*`, `mcp__claude-in-chrome__*`) : ils sont réservés au chef d'équipe.

## Fichiers et code

- Tu n'écris que dans les dossiers listés dans ton brief. Les dossiers partagés sont en lecture seule : s'il te manque quelque chose, crée-le chez toi et signale-le.
- TypeScript strict, pas de `any`. Aucune nouvelle dépendance npm.
- ESLint applique les règles du compilateur React, en erreurs : pas de `setState` appelé directement dans le corps d'un effet (dérive la valeur pendant le rendu, ou mets à jour depuis un abonnement ou un gestionnaire), pas de mutation d'une valeur venue d'un hook, pas de `ref.current` lu ou écrit pendant le rendu, pas de `Date.now()` ni `Math.random()` pendant le rendu (passe par `useNow()`, un `useState(() => …)` paresseux ou un effet).
- Classes Tailwind v4 et tokens de `globals.css`. Pas de couleur en dur hors des maquettes.
- Un commentaire dit pourquoi, jamais quoi. Tout le texte visible est en français.
