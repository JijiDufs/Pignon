# Brief — la fiche d'un commerce

Nom d'agent : `fiche`. Captures dans `.snap/fiche/`.

## Ton périmètre

- `src/app/(pignon)/app/commerces/[id]/page.tsx` (remplace le fichier provisoire ; lis l'id avec `useParams`)
- `src/components/fiche/**`

## Rôle de l'écran

La fiche est l'endroit où l'abonné prépare son appel. Il doit y trouver, dans cet ordre d'importance : la maquette à montrer, pourquoi ce commerce vaut le coup, ce qui cloche sur son site, quoi dire, et les actions (réserver, envoyer, suivre).

Données : `getBusiness(id)`, `getMaquetteContent`, `buildCallScript(business, user.firstName)`, `buildPrompt(business, da)`, `DAS`, `SITE_STATUS`.

## Moment signature : le score se dévoile, la maquette s'allume

À l'arrivée sur la fiche, la jauge (`ScoreDial size="lg" animate`) monte, puis les raisons s'alignent l'une après l'autre avec leurs points, et l'addition tombe juste : la somme des points est le score. Ensuite la maquette, élément allumé de l'écran (un seul `halo`), prend la lumière. Une seule séquence, à l'arrivée, puis plus rien ne bouge tout seul.

## Contenu

**En-tête.** Retour au radar, `BusinessMark`, nom, métier, adresse, distance, téléphone, gérant (« M. António Ferreira »), date de création, effectif. Actions : « Réserver ce commerce », étape du pipeline, « Préparer l'appel » (vers `/app/coach?commerce=:id`).

**La maquette** (le héros).
- `MaquetteFrame` bureau et mobile côte à côte. Un sélecteur de direction artistique : les trois recommandées d'abord (`recommendedDas`), puis la quatrième. Pour chacune : son nom, sa phrase, ses couleurs (`DAS`).
- Un curseur **avant / après** : à gauche la présence en ligne actuelle (`view="avant"`), à droite la maquette. Poignée à glisser, utilisable au clavier (`role="slider"`).
- **Partager** (formule Pro, `live-mockup`) : « Envoyer par SMS » ouvre un dialogue avec l'aperçu du message dans une bulle (`smsTemplate`, où `{lien}` devient l'adresse publique `location.origin + maquetteUrl(slug, da)`) ; « Copier le lien » ; « Ouvrir la maquette » dans un nouvel onglet. Les deux premiers appellent `shareMaquette`. Ouvrir la maquette dans un autre onglet déclenche pour de vrai l'alerte d'ouverture dans l'app : ne casse pas ce mécanisme (ne mets jamais `embed=1` sur le lien public).
- L'historique des ouvertures (`opens` du store) : « Ouverte 2 fois, la dernière il y a 12 min ».

**Pourquoi lui.** La jauge, les raisons (`reasons`, avec libellé, phrase et points), la valeur estimée (`estimatedDeal`).

**Le contrôle technique du site.** Présente le diagnostic comme le procès-verbal d'un contrôle technique : points de contrôle (HTTPS, mobile, vitesse, fraîcheur), défaillances classées par gravité (`findings`), verdict (`SiteStatusBadge label="full"`). L'adresse du site s'affiche en texte, jamais en lien. Si le commerçant paie déjà un abonnement pour son site (`paysSubscription`), dis-le : c'est un argument.

**Ses voisins.** Les trois concurrents les plus proches : qui a un site, à quelle distance, quelle note. Une phrase résume (« 2 de ses 3 voisins ont un site »).

**Le prompt.** Par direction artistique, `buildPrompt` dans un bloc en chasse fixe (`Panel tone="sunken"`), bouton « Copier le prompt » (presse-papiers et confirmation), et une phrase qui dit où le coller (Lovable, v0, Claude).

**Le script d'appel.** Le meilleur moment pour appeler, les quatre étapes en `voix`, les objections en accordéon, et « Passer en mode appel » (vers le coach).

**Le suivi.** Étape du pipeline (`PIPELINE_STAGES`, `setStage`), note libre (`updatePipelineEntry`), historique des appels (`calls`).

## Réserver

« Réserver ce commerce » appelle `reserve(id)`. Si ça réussit : le bouton devient l'état « Réservé, encore 30 jours », un cadenas se ferme, la fiche s'allume un instant (allumage). On peut libérer la réservation.

## Cas particuliers

- **Fiche verrouillée** (Découverte, quota non consommé) : à l'arrivée, appelle `unlock(id)`. S'il renvoie faux (quota épuisé), montre la fiche floutée sous un verrou, pas une page blanche.
- **Commerce pris par un autre abonné** (`takenByOthers`) : pas de coordonnées ni de maquette partageable. Un bandeau dit jusqu'à quand, avec « Me prévenir quand il se libère » (un interrupteur simulé).
- **Identifiant inconnu** : un écran vide qui renvoie au radar.

## Formules

- Découverte : une seule direction artistique visible ; prompt (`all-da-prompts`) et script (`call-script`) sous `PlanGate`, on voit qu'ils existent.
- Solo : tout sauf partage, alerte d'ouverture et réservation (`live-mockup`, `open-alert`, `lead-reservation`), montrés verrouillés.
- Pro et Agence : tout.

## À vérifier avant de rendre

- Trois commerces différents : un brûlant sans site, un site mort, un site daté (prends leurs identifiants dans `/app/radar` ou via `getOpportunities`).
- Formules Découverte, Solo et Pro. Mobile. Hauteur de capture généreuse (`--h 2400`) pour voir toute la fiche.
- Le curseur avant / après au clavier. Le changement de direction artistique. Le dialogue SMS.
- Les deux iframes ne font pas ramer la page (une seule maquette chargée par vue visible).
