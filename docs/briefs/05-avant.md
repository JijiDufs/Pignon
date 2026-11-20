# Brief — la page « avant »

Nom d'agent : `avant`. Captures dans `.snap/avant/`.

## Ton périmètre

- `src/app/(maquette)/m/[slug]/avant/page.tsx` (remplace le fichier provisoire)
- `src/maquettes/avant/**`

Inspire-toi de `src/app/(maquette)/m/[slug]/page.tsx` pour la structure (page prérendue, `params` et `searchParams` attendus dans un composant `async` sous `<Suspense>`, `notFound()` si le slug est inconnu). Le paramètre `embed=1` existe mais ne change rien ici : pas de bandeau, pas de suivi d'ouverture.

## Rôle

Dans la fiche d'un commerce, un curseur compare **avant** et **après** : à droite la maquette que le freelance propose, à gauche ce que le commerçant a aujourd'hui en ligne. Tu fabriques ce « avant ». Il doit être crédible, un peu triste, **jamais moqueur** : le commerçant le verra peut-être, et il doit se dire « oui, c'est vrai », pas se sentir humilié.

Tu sors de l'univers Pignon : aucun token, composant ou police de Pignon. Tout est déterministe à partir de `business` (`getBusinessBySlug`), en particulier `business.site` (`status`, `url`, `platform`, `copyrightYear`, `findings`, `https`, `mobileFriendly`).

## Une variante par statut de site

- **`none` (aucun site)** : une page de résultats d'un moteur de recherche générique et anonyme (n'imite aucune marque existante) pour « garage ferreira villeurbanne ». Les concurrents qui ont un site sortent en premier (`business.competitors`), puis une simple fiche d'annuaire pour le commerce, avec adresse et téléphone, et la mention « Site web : non renseigné ».
- **`social-only`** : une page de réseau social générique : photo de couverture vide, dernière publication datée d'il y a quatorze mois, horaires absents, quelques mentions « j'aime ». Aucun logo ni nom de plateforme réelle.
- **`dead`** : la page d'erreur d'un navigateur. Pour un lien `business.site` : « Cette page n'existe plus », le service ayant fermé en 2024. Pour un domaine expiré : « Ce site est inaccessible », ou une page de parking de nom de domaine.
- **`insecure`** : un vieux site, avec dans la barre d'adresse dessinée la mention « Non sécurisé ».
- **`not-mobile`** : un site figé à 980 px de large : sur mobile, texte minuscule et défilement horizontal (c'est le but), sur bureau une colonne étroite perdue au milieu de l'écran.
- **`outdated`** : un site des années 2010 : dégradés, boutons en relief, bandeau « Bienvenue sur notre site », compteur de visites, menu en onglets, copyright à l'année de `copyrightYear`. Si `platform` évoque un annuaire (Solocal), fais-en un gabarit d'annuaire reconnaissable à son uniformité, sans logo réel.
- **`ok`** : un site simple et correct.

Chaque variante utilise les vraies informations du commerce (nom, métier, ville, téléphone, quelques prestations de `getMaquetteContent`) pour qu'on reconnaisse bien le même commerce des deux côtés du curseur.

## Contraintes

- Composants serveur, prérendus : rien d'aléatoire, pas d'horloge pendant le rendu. Les dates « d'il y a quatorze mois » se calculent depuis `DEMO_TODAY`.
- Polices système d'époque (Arial, Verdana, Times, Georgia, Trebuchet) : c'est voulu, n'importe aucune police.
- La page s'affiche dans une iframe à 1280 × 800 ou 390 × 780, réduite : le problème du site doit se voir **au premier écran**, sans lire.
- Aucune image externe. Aucune marque, aucun logo réel.

## À vérifier avant de rendre

- Une capture bureau et mobile par statut (les sept), sur des commerces de métiers différents. La page `/m` liste des commerces avec leur statut et un lien « Avant » ; `curl -s localhost:3000/m` te donne les slugs, et tu peux en trouver d'autres par statut en écrivant un petit test vitest temporaire dans ton dossier (supprime-le ensuite).
- Le premier écran de chaque variante dit immédiatement ce qui ne va pas.
- Aucune erreur de console.
