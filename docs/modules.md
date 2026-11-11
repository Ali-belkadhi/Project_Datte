# Modules et contrats

| | A — Baha Ayadi | B — Ali Belkathi | C — Karim Ouertatani |
| --- | --- | --- | --- |
| Features | `features/comptes` | `features/catalogue` + `components/three` | `features/commandes` |
| Server Actions | `modules/comptes/actions.ts` | `modules/catalogue/actions.ts` | `modules/commandes/actions.ts` |
| Route Handlers | `api/auth` | `api/webhooks/meshy`, `api/cron/modeles-3d`, `api/ia/fiche-produit` | `api/webhooks/paiement`, `api/cron/versements`, `api/ia/assistant` |
| Intégrations | e-mail, SMS | Meshy | paiement, PDF |
| Modèles Prisma | Utilisateur, Client, Adresse, Fournisseur, DocumentFournisseur, Administrateur, Notification, AbonnementPush, Conversation, Message, Signalement, ParametresPlateforme, JournalAudit | Variete, CategorieDerive, Produit, ProduitDatte, ProduitDerive, OptionPoids, PhotoProduit, Modele3D, PackCredits3D, AchatCredits3D, MouvementCredit3D, Favori | Panier, LignePanier, Commande, SousCommande, LigneCommande, HistoriqueStatut, Paiement, Facture, CodePromo, Avis, PhotoAvis, Litige, Versement |
| IA | IA-A (Server Action `analyserDocuments`) | IA-B (Route Handler, `ia/fiche-produit.ts`) | IA-C (Route Handler, `ia/assistant-tools.ts`) |

Commun (les trois) : `server/core`, `integrations/ia`, `integrations/stockage`, `api/health`, `api/uploads`, `components/ui|layout|shared`.

## Contrats (`src/server/contracts`)

Les contrats sont déjà implémentés sur les mocks ; leur **signature ne change pas** quand Prisma, Auth.js ou les intégrations seront branchés.

### `comptes.ts` — fourni par A

| Fonction | Utilisée par |
| --- | --- |
| `getUtilisateurCourant(): Promise<Utilisateur>` | B, C |
| `requireRole(...roles)` | B, C |
| `notifier(utilisateurId, type, donnees)` | B (3D prête, crédits), C (statuts de commande) |
| `getFournisseur(id)`, `estFournisseurVerifie(id)`, `listFournisseursVerifies()` | B, C |

### `catalogue.ts` — fourni par B

| Fonction | Utilisée par |
| --- | --- |
| `getProduitPourPanier(id)`, `getProduitsPourPanier(ids)`, `getProduitBrut(id)` | C (panier, assistant) |
| `reserverStock(lignes)`, `libererStock(lignes)` | C (commande, annulation, refus) |
| `majNoteProduit(produitId)` | C (avis) |
| `rechercherProduits(filtres)`, `infosVariete(slug)` | C (assistant IA) |

### `commandes.ts` — fourni par C

| Fonction | Utilisée par |
| --- | --- |
| `initierPaiement(montant, objet)` | B (achat de crédits 3D) |

## Services de chaque module

- **A** : `utilisateurs` (session, adresses), `fournisseurs` (boutiques, dossiers, analyse IA), `notifications`, `messagerie`, `admin` (signalements, paramètres, file « À traiter »).
- **B** : `produits` (liste avec vendeurs, fiche, similaires, saison, vendeur, stock bas), `recherche`, `varietes`, `modeles3d`, `credits`, `favoris`.
- **C** : `panier` (scission par fournisseur), `commandes`, `paiements`, `factures`, `ventes` (KPIs), `avis` (répartition), `litiges`, `versements`, `assistant` (scénarios résolus via les contrats).
