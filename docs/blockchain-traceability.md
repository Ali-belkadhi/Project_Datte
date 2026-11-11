# Traçabilité Blockchain - partie Ali

Ce module relie `DateTraceability.sol` au catalogue MongoDB sans stocker de clé privée dans l'application.

## Responsabilités

- Solidity conserve les lots et leur historique append-only.
- Chaque lot créé par le nouveau contrat frappe un NFT ERC-721 `DLOT` au producteur. Le transfert du NFT ne modifie pas le producteur historique du lot.
- MetaMask signe `createLot` et `addTraceabilityStep`.
- Next.js vérifie les transactions confirmées avec un RPC serveur.
- MongoDB conserve uniquement le registre des lots créés par les fournisseurs et la liaison `productId` / `lotId`.
- La page `/tracabilite/[productId]` effectue une lecture publique sans wallet et affiche le token ainsi que son propriétaire actuel.
- La certification Baha reste gérée par le contrat séparé `ProductCertification`, relié au même registre de lots.
- Les anciens déploiements sans ERC-721 restent lisibles ; les champs NFT sont alors simplement absents jusqu'à la migration.

## Variables d'environnement

Copier les valeurs publiques et l'URL RPC dans `.env.local` :

```dotenv
APP_URL=http://localhost:3000
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID=1337
NEXT_PUBLIC_DATE_TRACEABILITY_ADDRESS=0x...
NEXT_PUBLIC_PRODUCT_CERTIFICATION_ADDRESS=0x...
```

Pour une application hébergée, `APP_URL` et `BLOCKCHAIN_RPC_URL` doivent être accessibles en ligne. `127.0.0.1` ne fonctionne que pour une démonstration locale.

Ne jamais ajouter une clé privée ou une phrase de récupération à ces fichiers.

## Commandes manuelles

Ces commandes ne sont pas exécutées automatiquement par Codex.

### Contrat Ali

```powershell
cd projet_Nextjs\blockchain
npm install
npx hardhat compile
npm run test:traceability
npm run deploy:all
```

Reporter les deux adresses affichées dans `NEXT_PUBLIC_DATE_TRACEABILITY_ADDRESS` et `NEXT_PUBLIC_PRODUCT_CERTIFICATION_ADDRESS`.

Attribuer les rôles séparément :

```powershell
$env:CONTRACT_ADDRESS="0x..."
$env:METAMASK_ADDRESS="0x..."
$env:ROLE_NAME="LOT_CREATOR_ROLE"
npx hardhat run scripts/grant-role.ts --network ganache

$env:ROLE_NAME="STEP_ADDER_ROLE"
npx hardhat run scripts/grant-role.ts --network ganache
```

### Application Next.js

Depuis `projet_Nextjs` :

```powershell
npm install
npm run typecheck
npm run lint
npm run dev
```

## Scénario manuel

1. Se connecter avec un fournisseur vérifié de type `PRODUCTEUR` ou `COOPERATIVE`.
2. Ouvrir `/fournisseur/tracabilite` et créer un lot avec le wallet possédant `LOT_CREATOR_ROLE`.
3. Se connecter avec un fournisseur `TRANSFORMATEUR` et rechercher le lot.
4. Ajouter une étape avec un wallet possédant `STEP_ADDER_ROLE`.
5. Associer un produit MongoDB existant au lot.
6. Ouvrir la fiche produit puis la page publique de traçabilité.
7. Vérifier le NFT `DLOT`, puis le transférer avec le wallet qui en est propriétaire si le parcours métier l'exige.
8. Scanner le QR Code depuis un appareil sans MetaMask.

## Migration d'un déploiement existant

L'ajout d'ERC-721 modifie le bytecode : il faut déployer une nouvelle paire de contrats, puis migrer les lots, étapes, certificats et index MongoDB. Après avoir sauvegardé Ganache et MongoDB :

```powershell
$env:NEW_DATE_TRACEABILITY_ADDRESS="0x..."
$env:NEW_PRODUCT_CERTIFICATION_ADDRESS="0x..."
npm run blockchain:migrate-tokenized
```

Le script utilise les adresses `NEXT_PUBLIC_*` comme sources et les variables `NEW_*` comme destinations. Il est idempotent pour les lots, les étapes et les certificats déjà migrés. Une fois la sortie contrôlée, remplacer les deux adresses `NEXT_PUBLIC_*` dans `.env.local` et redémarrer Next.js.

Les certificats déjà expirés ne peuvent pas être recréés avec une date passée (le contrat l'interdit) : ils sont recréés puis immédiatement révoqués avec un motif explicite. L'adresse émettrice on-chain devient le compte de migration ; le nom, le type, le hash et l'identifiant du certificat sont conservés.

## Mise en ligne

Le code est indépendant du réseau, mais les quatre valeurs doivent correspondre au même déploiement :

- RPC serveur ;
- chain ID sélectionné dans MetaMask ;
- adresse de `DateTraceability` ;
- adresse de `ProductCertification` déployé avec cette adresse de traçabilité.

Une modification de réseau nécessite un nouveau déploiement manuel du contrat et une nouvelle configuration. Les anciennes liaisons conservent leur chain ID et leur adresse de contrat afin d'éviter de présenter des données provenant du mauvais registre.
