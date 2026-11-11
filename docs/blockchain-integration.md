# Parcours Blockchain DEGLA — validation manuelle

Les commandes ci-dessous sont volontairement manuelles. Aucun script ne contient de clé privée et aucun contrat n'est déployé automatiquement.

## 1. Vérifier Ali — DateTraceability

Depuis `Project_DEGLA_Merged/blockchain` :

```powershell
npx hardhat compile
npx hardhat test test/DateTraceability.test.ts
```

`DateTraceability` frappe désormais un NFT ERC-721 `DLOT` par lot. Un ancien contrat sans NFT reste lisible par l'application, mais il doit être redéployé pour activer la tokenisation.

## 2. Compiler et tester Baha — ProductCertification

```powershell
npx hardhat compile
npx hardhat test test/ProductCertification.test.ts
```

## 3. Déployer ProductCertification après DateTraceability

```powershell
$env:TRACEABILITY_ADDRESS="0xADRESSE_DATE_TRACEABILITY"
npx hardhat run scripts/deploy-certification.ts --network ganache
```

Copier l'adresse affichée dans `Project_DEGLA_Merged/.env.local` :

```dotenv
NEXT_PUBLIC_PRODUCT_CERTIFICATION_ADDRESS=0xADRESSE_DU_CONTRAT
```

Redémarrer ensuite le serveur Next.js.

## 4. Donner le rôle certificateur au wallet MetaMask

```powershell
$env:CONTRACT_ADDRESS="0xADRESSE_DU_CONTRAT_PRODUCT_CERTIFICATION"
$env:METAMASK_ADDRESS="0xADRESSE_DU_WALLET_CERTIFICATEUR"
$env:ROLE_NAME="CERTIFIER_ROLE"
npx hardhat run scripts/grant-role.ts --network ganache
```

Le compte administrateur du site et le wallet certificateur sont deux contrôles indépendants : il faut être connecté comme administrateur dans DEGLA et signer avec un wallet possédant `CERTIFIER_ROLE`.

## 5. Scénario Agriculteur → Fabricant → Produit → Client

1. Créer et faire valider une boutique `PRODUCTEUR`.
2. Financer son wallet Ganache et lui attribuer `LOT_CREATOR_ROLE` et `STEP_ADDER_ROLE`.
3. Dans `/fournisseur/tracabilite`, créer le lot puis ajouter l'étape Récolte.
4. Créer et faire valider une seconde boutique `TRANSFORMATEUR` avec un wallet MetaMask distinct.
5. Financer ce second wallet et lui attribuer `STEP_ADDER_ROLE` sur DateTraceability.
6. Avec le transformateur, rechercher le lot puis ajouter Conditionnement et Transformation.
7. Créer et publier un produit réel dans MongoDB.
8. Dans `/fournisseur/tracabilite`, associer ce produit au lot.
9. Comme administrateur, ouvrir `/admin/certifications`, sélectionner le produit et émettre un certificat.
10. Ouvrir la fiche produit puis sa page de traçabilité/QR. La lecture publique ne demande pas MetaMask.
11. Vérifier l'identifiant et le propriétaire du NFT `DLOT`, puis tester son transfert depuis le wallet propriétaire.

Pour mettre à niveau des données existantes, suivre la procédure de `docs/blockchain-traceability.md` et exécuter `npm run blockchain:migrate-tokenized` après avoir déployé la nouvelle paire de contrats.

Un wallet ne peut être rattaché qu'à une seule boutique DEGLA sur un réseau et un contrat donnés. Utiliser des comptes MetaMask distincts pour démontrer les différents acteurs.

## 6. QR Code sur téléphone

`APP_URL=http://localhost:3000` produit un QR Code accessible uniquement sur l'ordinateur local. Pour un téléphone sur le même réseau, utiliser l'adresse IP LAN de l'ordinateur, par exemple :

```dotenv
APP_URL=http://192.168.1.20:3000
```

Pour un déploiement Internet, remplacer `APP_URL` par l'URL HTTPS publique et utiliser un réseau Blockchain accessible depuis le serveur au lieu de Ganache local.

## 7. Validation finale

Depuis la racine de `Project_DEGLA_Merged` :

```powershell
npm run typecheck
npm run lint
npm run test
```

Depuis `Project_DEGLA_Merged/blockchain` :

```powershell
npx hardhat test
```
