# Module Blockchain DEGLA

Le module conserve la séparation des responsabilités demandée :

- `DateTraceability` (Ali) possède les lots et l'historique de supply chain.
- `ProductCertification` (Baha) possède les certificats et consulte uniquement `lotExists` via l'interface publique d'Ali.
- MongoDB ne remplace jamais la Blockchain : il indexe les liens produit/lot et les correspondances boutique/wallet vérifiées par signature.

## Couches

- `domain/` : types métier de traçabilité et certification.
- `application/` : cas d'usage, validation des preuves et lecture publique.
- `infrastructure/ethers/` : ABI, RPC en lecture et transactions MetaMask.
- `infrastructure/mongo/` : index produit/lot et acteurs vérifiés.
- `presentation/` : espace fournisseur, espace certificateur et composants publics.

## Garanties

- Une transaction de création de lot est relue côté serveur avant son indexation MongoDB.
- Le wallet producteur signe une preuve séparée liant la transaction à la boutique connectée.
- Les étapes sont relues côté serveur et le wallet acteur signe la même preuve de contrôle.
- Un wallet ne peut pas être rattaché à deux boutiques sur le même contrat/réseau.
- Un produit ne peut plus changer de lot après son association.
- Un certificat n'est présenté comme valide qu'après appel de `verifyCertificate` sur le contrat.
- Les pages produit et QR effectuent une lecture serveur sans demander MetaMask au client.

Les commandes manuelles de validation et le scénario complet sont documentés dans `docs/blockchain-integration.md`.
