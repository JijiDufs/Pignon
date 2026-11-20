# Brief — le coach d'appel

Nom d'agent : `coach`. Captures dans `.snap/coach/`.

## Ton périmètre

- `src/app/(pignon)/app/coach/page.tsx` (remplace le fichier provisoire)
- `src/components/coach/**`

## Rôle de l'écran

C'est ce que l'abonné a sous les yeux **pendant qu'il téléphone** à un commerçant, et l'endroit où il s'entraîne avant. Deux modes, en onglets : **L'appel** et **Le simulateur**.

Pendant un appel, on ne lit pas une interface : on jette un œil. Donc gros caractères, très peu d'éléments, une seule chose mise en avant à la fois. Les répliques à dire sont en `voix` (Spectral), tout le reste en interface normale : la différence entre « ce que je dis » et « ce que je regarde » doit sauter aux yeux.

## Mode 1 : l'appel (formule Solo, `call-script`)

- **Choisir qui appeler** : `?commerce=:id` dans l'adresse présélectionne un commerce. Sinon, une file des commerces du pipeline aux étapes « à appeler » puis « appelé », les plus chauds d'abord.
- **Avant de décrocher** : `BusinessMark`, nom, gérant, téléphone en très grand, le meilleur moment (`bestTime`, `bestTimeWhy`), les trois raisons les plus fortes en rappel, une vignette de la maquette (`MaquetteFrame`, non interactive).
- **Moment signature : « Décrocher ».** Au clic, l'écran passe en mode appel : tout le superflu s'efface, le prompteur s'allume (allumage), le chronomètre démarre. C'est une vraie transition d'état, pas un simple changement d'onglet.
- **Le prompteur** : les quatre étapes du script (`buildCallScript(business, user.firstName)`). L'étape en cours est grande et lumineuse, la suivante se devine, les passées s'estompent. On avance avec Espace ou les flèches, ou au clic. Chaque étape affiche sa durée cible et son conseil (`tip`) en petit. Le chronomètre de l'appel tourne en haut.
- **Les objections** : toujours à portée de main, sous forme de touches (« Il dit : j'ai assez de clients »). Un clic ou un raccourci clavier (1 à 5) affiche la réponse en grand à la place de l'étape, puis on revient au script.
- **Envoyer la maquette** pendant l'appel : un bouton « Envoyer par SMS » (formule Pro, `live-mockup`, sinon `LockChip`) qui appelle `shareMaquette` et confirme. Si une ouverture de la maquette arrive pendant l'appel (store `opens`), un signal bien visible le dit : « Il la regarde ».
- **Raccrocher** : quatre issues, rendez-vous pris, à rappeler, pas intéressé, répondeur. Elles appellent `logCall(id, issue, durée)`. Pour un rendez-vous, on fixe la date. Puis l'écran propose le commerce suivant de la file.
- Le bilan du jour, discret : appels passés aujourd'hui, rendez-vous pris (`calls`).

Sur Découverte, le mode est sous `PlanGate` avec un aperçu réel derrière. File vide : un état vide qui renvoie au radar.

## Mode 2 : le simulateur (formule Pro, `call-simulator`)

S'entraîner face à un commerçant joué par la machine. Rien n'est envoyé nulle part : c'est un moteur de dialogue écrit par toi, déterministe.

- **Le décor** : on choisit un commerce (le commerçant porte son nom, son métier, ses vraies données) et une humeur : sympa, pressé, méfiant.
- **Le dialogue** : le commerçant « parle » (bulle de texte, indicateur de frappe, une onde de voix qui s'anime pendant qu'il répond). L'abonné répond en choisissant parmi trois répliques proposées (une bonne, une moyenne, une maladroite, dans un ordre qui varie de façon déterministe), ou en tapant sa phrase, rapprochée par mots-clés de la réplique la plus proche.
- **L'arbre** : ouverture, raison de l'appel, une ou deux objections tirées de `objections` selon l'humeur, la maquette, la prise de rendez-vous. Une mauvaise réponse peut faire raccrocher le commerçant.
- **Moment signature : la jauge d'humeur.** Une jauge va d'agacé à intéressé et bouge à chaque réplique, avec la réaction écrite du commerçant. On sent tout de suite si la phrase a porté.
- **Le débrief** à la fin : rendez-vous obtenu ou non, une note par compétence (ouverture, personnalisation, objections, conclusion), la meilleure réplique et celle à retravailler, avec la version qui aurait marché. Un bouton « Rejouer ».

Sous `PlanGate feature="call-simulator"` pour les formules en dessous de Pro.

## À vérifier avant de rendre

- Mode appel : avant de décrocher, en cours d'appel (étape 2, puis une objection ouverte), l'écran d'issue. Formules Découverte et Solo. Mobile.
- Simulateur : en cours de dialogue, débrief. Formule Solo (verrou).
- Tout le mode appel sans la souris.
- Le chronomètre et les minuteurs s'arrêtent quand on quitte l'écran (pas de fuite). Mouvement réduit respecté.
