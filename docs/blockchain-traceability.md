# Traçabilité Blockchain - partie Ali

Ce module relie `DateTraceability.sol` au catalogue MongoDB sans stocker de clé privée dans l'application.

## Responsabilités

- Solidity conserve les lots et leur historique append-only.
- Chaque lot est aussi représenté par un NFT ERC-721 `DLOT`, frappé automatiquement au producteur lors de `createLot`.
- MetaMask signe `createLot` et `addTraceabilityStep`.
- Next.js vérifie les transactions confirmées avec un RPC serveur.
- MongoDB conserve uniquement le registre des lots créés par les fournisseurs et la liaison `productId` / `lotId`.
- La page `/tracabilite/[productId]` effectue une lecture publique sans wallet.
- La page publique affiche le `tokenId` et le propriétaire ERC-721 actuel du lot.
- La certification Baha utilise le contrat séparé `ProductCertification`, relié au même registre de lots.

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
cd Project_DEGLA_Merged\blockchain
npm install
npx hardhat compile
npx hardhat test test/DateTraceability.test.ts
npx hardhat run scripts/deploy-traceability.ts --network ganache
```

Reporter l'adresse affichée dans `NEXT_PUBLIC_DATE_TRACEABILITY_ADDRESS`.

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

Depuis `Project_DEGLA_Merged` :

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
7. Scanner le QR Code depuis un appareil sans MetaMask.

## Mise en ligne

Le code est indépendant du réseau, mais les quatre valeurs doivent correspondre au même déploiement :

- RPC serveur ;
- chain ID sélectionné dans MetaMask ;
- adresse de `DateTraceability` ;
- adresse de `ProductCertification`.

Une modification de réseau nécessite un nouveau déploiement manuel du contrat et une nouvelle configuration. Les anciennes liaisons conservent leur chain ID et leur adresse de contrat afin d'éviter de présenter des données provenant du mauvais registre.
