# Brief — connexion, inscription et premier lancement

Nom d'agent : `inscription`. Captures dans `.snap/inscription/`.

## Ton périmètre

- `src/app/(pignon)/connexion/page.tsx`
- `src/app/(pignon)/inscription/page.tsx`
- `src/app/(pignon)/bienvenue/page.tsx`
- `src/components/auth/**`, `src/components/onboarding/**`

Remplace les trois fichiers provisoires. Ces pages sont **hors de `/app`**, donc prérendues : relis les règles Next de `CLAUDE.md`. En pratique : des composants client dont le store n'est lu et écrit que dans des gestionnaires d'événements ou après montage (`useIsClient()` de `@/lib/store`), `useSearchParams()` dans un composant sous `<Suspense>`.

Rien n'est branché : aucun compte n'est créé, aucun mot de passe n'est vérifié ni conservé. Dis-le sobrement sur chaque formulaire (« Démo : n'importe quel e-mail fonctionne, rien n'est enregistré en ligne »). Ne stocke jamais le mot de passe saisi, nulle part.

## Écran 1 : `/connexion`

E-mail, mot de passe, « Se connecter » qui mène à `/app`. Un lien vers l'inscription. La page est en deux parties : le formulaire, et une image de marque dessinée dans le code (la rue à l'heure bleue, quelques pignons, une vitrine allumée). Sobre : c'est une porte d'entrée.

## Écran 2 : `/inscription`

Prénom, e-mail, mot de passe. À l'envoi : `startFresh({ firstName, email })` puis `/bienvenue`. Si l'adresse contient `?formule=<id>` (on vient de la page des tarifs), garde-le et transmets-le à `/bienvenue?formule=<id>` : la formule choisie est rappelée (« Tu as choisi Pro, tu l'activeras à l'étape suivante »).

À côté du formulaire, ce qu'on obtient gratuitement (les `highlights` de la formule Découverte dans `PLANS`), sans exagération.

Validation des champs claire et en français, au bon moment (pas d'erreur avant d'avoir quitté le champ), erreurs reliées aux champs pour les lecteurs d'écran.

## Écran 3 : `/bienvenue` (premier lancement)

Trois étapes, une vraie suite : ici une numérotation et une barre de progression sont légitimes. On peut revenir en arrière. Chaque étape tient sur un écran, sans défilement à 1440 × 900.

1. **Où prospectes-tu ?** Une ville (propositions parmi `CITIES`) et un rayon (2 à 10 km). À côté, une `PignonMap` non interactive centrée sur la ville, avec le cercle du rayon qui grandit et rétrécit en direct, et la carte qui glisse quand on change de ville.
2. **Quels métiers ?** Les huit métiers (`SECTORS`, avec `SectorIcon`) en grandes pastilles à cocher. Sous chacun, le nombre de commerces sans site digne de ce nom dans la zone choisie (`getZoneStats(cityId, { sectors: [id], radiusKm })`).
3. **Ta zone est prête.** Le récapitulatif : la ville, le rayon, les métiers, et les deux chiffres qui donnent envie : le nombre d'opportunités et le chiffre d'affaires potentiel (`getZoneStats`).

**Moment signature** : à l'étape 2, chaque métier coché s'allume (allumage sur sa pastille) et le total d'opportunités en bas de l'écran monte en direct (`AnimatedNumber`). À l'étape 3, le total final se compose sous les yeux de l'utilisateur. L'attention va au chiffre qui grossit.

Le bouton final, « Lancer mon premier scan », appelle `completeOnboarding({ cityId, radiusKm, sectors })` puis mène à `/app/radar?scan=1` (ou à `/app/abonnement?choisir=<id>` si une formule payante avait été choisie à l'inscription).

Quelqu'un qui arrive sur `/bienvenue` avec un compte déjà configuré (`onboarded` vrai) peut refaire le parcours : c'est aussi la façon de changer de zone depuis la démo. Préremplis avec la zone actuelle, après montage.

## À vérifier avant de rendre

- Les trois pages en bureau et en mobile. `/bienvenue` à chaque étape (`--click` sur le bouton suivant).
- Le parcours complet au clavier : inscription, trois étapes, arrivée dans l'app.
- Les erreurs de formulaire (champ vide, e-mail mal formé).
- Aucune erreur de console, en particulier aucune erreur de prérendu ni d'hydratation (regarde aussi la sortie du serveur de dev si tu as un doute : les erreurs de validation y sont décrites avec leur correction).
