# Installer DEGLA sur Windows et l'utiliser hors ligne

L'édition de bureau conserve l'interface Next.js et ajoute un lanceur Electron. L'installateur embarque le serveur de production, Node.js, MongoDB Community et une copie initiale des médias et du catalogue. Aucun téléchargement n'est nécessaire au démarrage de l'application installée.

## Installation

Ouvrir l'installateur `DEGLA-0.1.0-Setup.exe` du dossier `release`, choisir l'emplacement proposé puis utiliser le raccourci **DEGLA**. Le serveur web et la base MongoDB sont lancés automatiquement en arrière-plan, uniquement sur l'adresse locale `127.0.0.1`. Ils sont arrêtés à la fermeture de l'application.

Les données sont conservées dans le dossier utilisateur de l'application Electron, sous `data/mongo` et `data/media`. La désinstallation conserve ces données. Au premier démarrage, le catalogue initial est importé par identifiant MongoDB : chaque document absent est ajouté avec un upsert `$setOnInsert`, tandis qu'un document existant garde ses valeurs. Les identifiants `ObjectId` et les dates sont préservés grâce au format EJSON.

Si ce premier import est interrompu, le démarrage suivant reprend les documents manquants sans écraser ceux déjà présents. Le marqueur `data/.initialized-v1.json` est écrit après la réussite de l'initialisation et de la copie des médias. Aux démarrages suivants, l'import initial est ignoré : les produits supprimés par l'utilisateur ne sont pas recréés et ses modifications sont conservées. Les médias existants ne sont pas remplacés lors d'une reprise.

Emplacement habituel sur ce PC : `%APPDATA%\DEGLA`. Le journal se trouve dans `degla.log`, la base dans `data\mongo` et les fichiers dans `data\media`. Le fichier `http-port.json` conserve le port local préféré pour garder la même origine navigateur et le thème choisi ; un autre port est utilisé si celui-ci est occupé.

## Fonctionnement hors ligne

Le catalogue, la gestion locale des produits, les favoris, les photos, les crédits locaux et la visualisation des modèles 3D déjà enregistrés utilisent le serveur et la base embarqués. Les écrans de comptes et de commandes conservent les simulations de la version web ; cette installation ne les transforme pas en authentification ou paiement réel.

La création de nouveaux modèles 3D avec Hugging Face/TRELLIS ou Meshy utilise des services distants et nécessite Internet. Aucun poids de modèle IA ni environnement GPU n'est installé avec cette édition. Les éventuels médias pointant vers une URL externe nécessitent également une connexion. L'installateur ne contient aucune clé API de l'environnement de développement.

## Produire un nouvel installateur

La machine de compilation doit disposer de Node.js compatible avec le projet, des dépendances npm et de MongoDB Community pour Windows x64. Une connexion Internet est nécessaire pour la première installation des outils Electron/NSIS et pour la première compilation des polices Google. Les ressources obtenues sont ensuite embarquées.

Depuis la racine du projet :

```powershell
npm run desktop:dist
```

Cette commande prépare la compilation Next.js autonome dans `.next-desktop`, copie les ressources dans `desktop-resources`, puis fabrique l'installateur NSIS dans `release`. `npm run desktop:prepare` prépare uniquement les ressources. `node scripts/build-desktop.cjs --skip-prepare` reconstruit seulement l'installateur depuis des ressources déjà vérifiées. `npm run desktop:dev` ouvre le lanceur de développement après préparation.

Vérifications disponibles :

```powershell
node --test tests/favorites.test.mjs tests/desktop-runtime.test.cjs
npm run typecheck
```

Variables facultatives de préparation :

| Variable | Rôle |
| --- | --- |
| `DEGLA_MONGOD_PATH` | Chemin vers `mongod.exe` si la détection dans Program Files ne convient pas. |
| `DEGLA_SEED_FILE` | Chemin du catalogue initial EJSON ; par défaut `desktop-seed/catalogue.json`. |
| `MONGODB_URI` | Base source utilisée uniquement pour créer le catalogue initial. Sa valeur n'est pas copiée dans l'installation. |
| `NEXT_BUILD_CPUS` | Nombre de workers de compilation ; valeur par défaut 1 pour cette préparation. |

`node scripts/prepare-desktop.cjs --refresh-seed` renouvelle le catalogue initial depuis la base source. Seules les collections du module Catalogue sont exportées : `products`, `varietes`, `categoriederives`, `packcredits`, `creditsoldes`, `creditmouvements`, `modele3ds`, `favoris`. Les comptes, mots de passe et clés d'API sont exclus. Les favoris et les données commerciales du catalogue sont inclus : distribuer un jeu de données de démonstration approprié.

`node scripts/prepare-desktop.cjs --skip-build` réutilise une compilation `.next-desktop` déjà préparée ; il faut reconstruire après toute modification du code web. Les `.env` sont exclus de la copie. Les répertoires générés ne doivent pas être ajoutés aux sources Git.

## Limites de distribution

L'installateur de développement peut être non signé et déclencher un contrôle de réputation Windows. Une distribution publique nécessite une signature de code appropriée. Les licences des composants embarqués, notamment MongoDB Community, sont conservées dans les ressources ; leur redistribution doit respecter leurs conditions.

La base locale n'est pas automatiquement synchronisée avec le site web ou une autre machine. Conserver des sauvegardes du dossier de données avant un changement de poste.
