# Brief — les tarifs, l'abonnement et les réglages

Nom d'agent : `abonnement`. Captures dans `.snap/abonnement/`.

## Ton périmètre

- `src/app/(pignon)/tarifs/page.tsx` (page publique, prérendue : relis les règles Next de `CLAUDE.md`)
- `src/app/(pignon)/app/abonnement/page.tsx`
- `src/app/(pignon)/app/reglages/page.tsx`
- `src/components/pricing/**`, `src/components/billing/**`, `src/components/settings/**`

Remplace les trois fichiers provisoires. Tout vient de `@/lib/plans` (`PLANS`, `FEATURES`, `yearlySaving`) : aucun prix écrit en dur.

**Rien n'est branché, et rien ne doit ressembler à un vrai paiement.** Aucun champ où l'on pourrait taper un numéro de carte. Partout où il y aurait un moyen de paiement, une carte de démonstration non modifiable (« Carte de démonstration, se terminant par 4242 ») et la mention « Mode démo : aucun paiement n'est effectué ».

## Les composants de tarifs (`components/pricing`)

Utilisés par la page publique et par l'app : conçois-les une fois.
- La bascule mensuel / annuel, qui dit l'économie réelle en euros (`yearlySaving`).
- Les quatre formules. Pas quatre cartes jumelles : la formule Pro (`recommended`) est l'élément allumé, les autres restent dans la pénombre. Chaque formule : nom, à qui elle s'adresse (`audience`), prix, ce qu'elle apporte (`highlights`), son bouton.
- Le tableau comparatif complet : les limites (`limits`) puis les fonctionnalités (`FEATURES`), groupées par thème (trouver, préparer, démarcher, exclusivité, équipe). Lisible sur mobile (une formule à la fois, avec un sélecteur).

## Écran 1 : `/tarifs`

Avec `SiteHeader` et `SiteFooter`. Les boutons mènent à `/inscription?formule=<id>`.

**Moment signature : le calcul qui rembourse l'abonnement.** Un simulateur que le visiteur manipule : « Combien de sites tu signes par mois ? » (curseur de 0 à 10) et « À quel prix moyen ? » (curseur de 500 à 3 000 €). En direct, avec `AnimatedNumber` : ce que ça rapporte par mois, et combien de fois la formule choisie est remboursée. Une figure simple accompagne le chiffre (par exemple une pile de pignons allumés, un par site signé). C'est l'argument principal de la page : un site signé rembourse l'année.

Puis le tableau comparatif, des questions de facturation en accordéon (changer de formule, arrêter, facture, moyen de paiement, ce qui se passe avec mes maquettes si j'arrête : elles restent en ligne tant que l'abonnement est actif), et un dernier appel à l'action.

## Écran 2 : `/app/abonnement`

- **Ta formule** : nom, prix, cycle, prochaine échéance (une date fixe calculée depuis l'horloge du navigateur, sans importance), et tes consommations en jauges : fiches ouvertes (`useQuota`), réservations actives, territoires, zones.
- **Changer de formule** : les composants de tarifs, en version « dans l'app » (la formule en cours est marquée, les boutons disent « Passer à Pro » ou « Revenir à Solo »).
- **Le paiement factice** : un dialogue qui s'ouvre au choix d'une formule, et automatiquement quand l'adresse contient `?choisir=<formule>` (c'est là qu'arrive le dialogue de verrou global de l'app). Il contient : le récapitulatif (formule, cycle modifiable, montant, ce qui se débloque), la carte de démonstration, la mention du mode démo, et « Confirmer ».
- **Moment signature : le déblocage.** À la confirmation : un court traitement (une seconde, avec un état clair), puis un écran de réussite où les fonctionnalités gagnées s'allument une à une (allumage), chacune avec un lien vers l'endroit où s'en servir. C'est à ce moment qu'on appelle `setPlan(formule, cycle)`.
- **Descendre ou arrêter** : une confirmation qui dit précisément ce qu'on perd (les maquettes en ligne sont dépubliées, les réservations libérées), sans chantage. `setPlan("free")`.
- **Factures** : une liste factice et cohérente avec la formule (dates, montants), le téléchargement désactivé et marqué « Démo ».

## Écran 3 : `/app/reglages`

Des onglets ou des sections :
- **Profil** : prénom, nom, e-mail, société (`setUser`). L'enregistrement se confirme.
- **Zone** : ville, rayon, métiers (`setZone`), et le nombre de zones permis par la formule (`limits.zones`). Ajouter une zone au-delà de la limite propose la formule supérieure.
- **Notifications** : des interrupteurs (`preferences`, `setPreference`, clés existantes : `notify-open`, `notify-new-business`, `weekly-digest` ; tu peux en ajouter). Ceux qui dépendent d'une fonctionnalité verrouillée le montrent (`LockChip`).
- **Équipe** (Agence, `team-seats`) : les trois comptes, des invitations simulées.
- **Ta marque** (Agence, `white-label`) : nom affiché et couleur sur le bandeau des maquettes, avec un aperçu du bandeau. Simulé.
- **Démo** : réinitialiser les données (`resetDemo`), repartir d'un compte neuf (`startFresh` puis `/bienvenue`).

## À vérifier avant de rendre

- `/tarifs` : bureau et mobile en pleine page, la bascule annuelle, le simulateur à deux positions.
- `/app/abonnement` : formules Découverte, Pro, Agence ; le dialogue de paiement (`/app/abonnement?choisir=pro` avec `--plan solo`) ; l'écran de réussite ; mobile.
- `/app/reglages` : chaque onglet, formules Solo et Agence, mobile.
- Aucun champ de carte bancaire nulle part. Les formulaires au clavier, avec des libellés liés aux champs.
