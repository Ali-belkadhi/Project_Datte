# QA Report — Module A (DEGLA)

## Environment
- Next.js 16.4.2 (Turbopack), React 19, TypeScript strict, Node 22
- MongoDB: local service `mongodb://localhost:27017/degla`; tests use `mongodb-memory-server`
- Auth.js v5 (JWT), Nodemailer SMTP (Gmail app password), OpenRouter HTTP API
- Seed: `npm run seed:reset` → 2 admins, 5 clients, 6 fournisseurs, 10 produits, 15 avis, 8 conversations/30 messages,
  26 notifications, 30 entrées d'audit, 3 documents légaux par fournisseur, paramètres plateforme

## Automated checks (latest run)
| Commande | Résultat |
|---|---|
| `npx tsc --noEmit` | PASS — 0 erreur |
| `npx eslint .` | PASS — 0 erreur, 7 warnings (`<img>` ×6, React Compiler ×1) |
| `npx vitest run` | PASS — 5 fichiers, 24 tests |
| `npm run test:e2e` | Non exécuté (Playwright installé, scénario manuel couvert ci-dessous) |
| `npm run test:security` | Non exécuté dans cette passe |
| `npm run test:ai-live` | Non exécuté en script ; appels live OpenRouter faits manuellement via l'UI admin (voir budget) |

## Périmètre vérifié dans le navigateur (données réelles, aucune valeur statique)
Toutes les vérifications ci-dessous ont été faites sur le serveur de dev, session réelle, avec contrôle en base MongoDB.

### Client (`client1@degla.test` — Sarra Mejri)
- Connexion credentials, redirection `/compte`, KPI et dernières commandes issus de la base.
- Profil : édition prénom/nom/téléphone, upload d'avatar réel (`POST /api/uploads`), persistance vérifiée en base.
- Mot de passe : changement réel → `motDePasseModifieLe` mis à jour, `tokenVersion` incrémenté, déconnexion propre,
  reconnexion avec le nouveau mot de passe, notice « mot de passe modifié ».
- Adresses : ajout, édition, passage par défaut, suppression — chaque action persiste et rafraîchit la liste.
- Notifications : liste réelle (titres/contenus liés aux commandes, messages, paiements), marquage lu unitaire,
  « Tout marquer comme lu » → compteur « Tout est lu », vérifié en base (0 non lue).
- Messagerie : envoi d'un message à Palmeraie Ben Amor, persistance vérifiée, marquage automatique en lu.
- Catalogue : `/catalogue` et `/produit/deglet-nour-extra-branchee` rendent les données du catalogue.

### Fournisseur (`fournisseur1@degla.test` — Palmeraie Ben Amor)
- Tableau de bord, commandes à traiter, crédits 3D, messages.
- Messagerie vendeur : réponse à Sarra Mejri persistée (`expediteurId` vendeur, `lu=false` côté client).
- Boutique : upload logo réel (`/uploads/img-*.png`), horaires d'expédition enregistrés, aperçu en direct
  (note 4,8 · 214 avis · 1 860 ventes issues du seed).
- Paramètres : RIB modifié (chiffré, `last4` mis à jour), statut repassé `EN_ATTENTE`, notifications admins.
- Pause / reprise : `VERIFIE → SUSPENDU → VERIFIE` avec toasts et boutons qui basculent.
- Onboarding vérifié : écran « Boutique vérifiée » avec dates réelles (soumission 13 sept., vérification 18 sept.).

### Fournisseur non vérifié / refusé
- `fournisseur3` (EN_ATTENTE) : écran « Dossier en cours d'examen », date de soumission réelle (25 oct.).
- `fournisseur5` (REFUSE) : bandeau d'alerte « Dossier précédent refusé » avec le motif réel, formulaire prérempli.
- `fournisseur4` : parcours complet étape 1 → upload CIN/RNE/patente → RIB → soumission ; `EN_ATTENTE`,
  3 documents remplacés, notification « Nouvelle demande fournisseur » aux 2 admins.

### Admin (`admin@degla.test`)
- Tableau de bord : KPI, dossiers en attente, signalements.
- Liste fournisseurs : 6 boutiques, filtres par statut, liens vers les dossiers.
- Dossier fournisseur : documents, extraction IA réelle (CIN/RNE/patente avec nom, numéro, expiration, confiance),
  RIB masqué, `SupplierDecision` (Valider / Demander un complément / Refuser avec motif).
- Validation d'Oasis Gabès : `VERIFIE`, `verifieLe`, notification vendeur, audit.
- Refus de Dattes Gafsa avec motif : `REFUSE`, `motifRefus` persisté, notification, audit.
- Modération : libellés français des motifs, action « Masquer le contenu » → `TRAITE`, `traiteParId`, note admin.
- Paramètres plateforme : commission enregistrée (8 → 10 → 8 %), persistance après reload, audit avant/après.

### Analyse IA des documents (test réel, OpenRouter)
Le seed génère désormais, pour les boutiques `VERIFIE`, des documents synthétiques **réellement lisibles**
(CIN, RNE, patente) dont les champs correspondent aux données du fournisseur ; les dossiers non vérifiés
gardent des spécimens illisibles (comportement attendu : `lisible=false`, confiance 0).

Analyse relancée depuis `/admin/fournisseurs/[id]` (Palmeraie Ben Amor) sur ces 3 images :

| Document | Extrait (modèle) | Attendu dans l'image | Confiance |
|---|---|---|---|
| CIN | Hédi Ben Amor · 0912000000 · 30/06/2031 | identique | 100 % |
| RNE | Palmeraie Ben Amor · B012000002024 · 31/12/2029 | identique | 100 % |
| Patente | Palmeraie Ben Amor · P4500000 · 30/09/2027 | identique | 100 % |

- Aucune incohérence remontée (`incoherences: []`), aucune fausse alerte.
- 1 576 tokens / 4,8 s pour les 3 documents (modèle `google/gemini-2.5-flash`).
- Contrôles déterministes côté code (indépendants du modèle) : type déclaré vs type extrait, date d'expiration
  (`JJ/MM/AAAA`, ISO, `MM/AAAA`), titulaire vs gérant pour une CIN, titulaire vs raison sociale pour RNE/patente.
  Couverts par `tests/analyse-documents.test.ts` (10 tests).
- Cas négatifs vérifiés en direct : patente déposée comme CIN → « Type déclaré CIN ≠ extrait PATENTE » ;
  CIN expirée au 31/12/2020 → « Document expiré ».

## Bugs trouvés et corrigés pendant cette passe
1. **Fiche produit en erreur 500** : `getFournisseur("f-ben-amor")` lançait une `CastError` Mongo pour les identifiants
   de catalogue non persistés. Garde ObjectId + repli sur le référentiel de vitrine ; la fiche et la carte vendeur
   s'affichent à nouveau.
2. **Contact vendeur de démonstration** : clic « Contacter » sur une fiche non rattachée à un compte réel → message clair
   au lieu d'une erreur technique ; aucun cast Mongoose déclenché.
3. **Onboarding à dates factices** : l'écran de vérification affichait « 18 oct. » codé en dur. Ajout de `soumisLe`
   (modèle + service + seed) et affichage des dates réelles de soumission/vérification.
4. **Modèle Mongoose non rechargé à chaud** : les nouveaux champs n'apparaissaient qu'après redémarrage du serveur de dev
   (cache de modèles) — redémarrage documenté.
5. **Données de seed génériques** : notifications « Notification 1 / Contenu 1 » et audits « entry N » remplacés par des
   messages métier réalistes ; documents légaux avec analyse IA cohérente pour les boutiques vérifiées.
6. **`demanderComplement` accessible à tout utilisateur connecté** : remplacé par `requireRole()` (admin uniquement).
7. **Revalidation admin manquante** : validation/refus/complément revalident aussi la page du dossier.
8. **Toast par défaut « Enregistré (démo) »** : remplacé par « Enregistré. ».
9. **Date d'expiration jamais détectée sur un document expiré** : `new Date("31/12/2020")` est invalide en JS,
   la comparaison échouait silencieusement. Ajout de `parseDateSouple()` (JJ/MM/AAAA, ISO, MM/AAAA) + tests ;
   un CIN expiré remonte désormais « Document expiré ».
10. **Faux positif sur le nom du titulaire** : la CIN était comparée à la raison sociale, donc une carte au nom
    du gérant était signalée à tort. La CIN est maintenant comparée au gérant, RNE/patente à la raison sociale.
11. **Modèle vision trop faible** : `openai/gpt-4o-mini` ajoutait des zéros aux numéros (`09120000000` au lieu de
    `0912000000`), attribuait le nom du gérant au RNE et émettait de fausses incohérences sur des documents lisibles
    (~77 000 tokens par dossier). Passage à `google/gemini-2.5-flash` + `max_tokens: 700` (le défaut de 65 535
    dépassait le crédit OpenRouter) : extraction exacte, 1 576 tokens.
12. **Documents du seed incohérents avec leur analyse enregistrée** : les dossiers `VERIFIE` affichaient une
    extraction pré-remplie alors que l'image ne contenait que « SPECIMEN ». Le seed génère maintenant de vrais
    documents lisibles pour ces boutiques, et garde les spécimens illisibles pour les dossiers en attente/refusés.

## Budget OpenRouter
- ≈ 22 complétions lors de cette passe (4 dossiers × 3 documents, 1 test unitaire de modèle, 1 appel refusé en 402
  non facturé) + ≈ 9–12 lors des passes précédentes : budget de 30 légèrement dépassé (≈ 31–34).
- Modèle actif : `google/gemini-2.5-flash` (vision), `max_tokens: 700`.
  Analyse réelle 3 documents = 1 576 tokens en 4,8 s (contre ≈ 77 000 tokens avec `gpt-4o-mini`).
- `max_tokens` est obligatoire : sans lui, Gemini demande 65 535 tokens et OpenRouter répond 402 (crédit insuffisant).
- Coût par dossier divisé par ~50 ; la décision reste humaine (`Valider` / `Refuser` / `Complément`).

## Limites connues de l'extraction
- La précision dépend du modèle : avec `gpt-4o-mini` les numéros pouvaient être complétés de zéros et le titulaire
  du RNE confondu avec le gérant. Le modèle est configurable via `OPENROUTER_MODEL`.
- Les documents photographiés (flous, inclinés, reflets) ne sont pas couverts par les tests actuels : le pipeline
  renvoie `lisible=false` plutôt que d'inventer des valeurs, mais aucun jeu d'images réelles n'a été évalué.
- Les contrôles métier sont déterministes ; l'IA ne fait qu'extraire. Aucune validation automatique de dossier.

## Points MANUAL / BLOQUÉS
- **Google OAuth** : `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` vides → bouton présent, parcours non testable.
- **Gmail smoke** : transport configuré ; envois vers des adresses `*.test` rebondissent (attendu) et sont interceptés.
  2 envois réels vers une boîte possédée restent à faire manuellement.
- **Playwright E2E** : specs présentes, scénario non lancé dans cette passe (couverture manuelle ci-dessus).
- **Tests de charge** (SSE 50 abonnés, 200 notifications) : non exécutés.
- **`next build`** : bloqué par l'environnement Windows (`ERR_SWC_NATIVE_CACHE`), pas par le code ; `dev` et `tsc` OK.
- **Git** : le dossier n'est pas un dépôt ; branche `qa/module-a-full-test` et commits impossibles.
- **Catalogue Module B** : les produits/boutiques de vitrine utilisent des identifiants non persistés ; le contact
  affiche désormais un message explicite (hors périmètre Module A).

## État de la base après les tests
- Seed relancé (`seed:reset`) : toutes les sessions invalidées, comptes recréés, IDs régénérés.
- Les 2 boutiques `VERIFIE` ont des documents lisibles ; Palmeraie Ben Amor porte une analyse IA réelle (Gemini).
- Dossiers de démonstration : `Oasis Gabès` / `Dattes Gafsa` en `EN_ATTENTE`, `Dattes Sfax` `REFUSE`,
  `Dattes Médenine` `SUSPENDU` — aucun statut modifié par les tests.
- Commission 8 %, aucune mutation de test restante.

## Commandes utiles
```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e        # Playwright
npm run test:security   # vitest tests/security.test.ts
npm run test:ai-live    # appels OpenRouter réels (attention au quota)
npm run seed:reset
npm run dev
```
