# QA Progress — Module A (DEGLA)

## Statut global
Module A entièrement piloté par la base (aucune donnée statique sur les écrans comptes/vendeur/admin),
vérifié dans le navigateur avec contrôle direct en MongoDB.

## Automatisé
- [x] Phase 0 — baseline : `tsc --noEmit` PASS (0 erreur)
- [x] Lint : `eslint .` PASS (0 erreur, 7 warnings non bloquants)
- [x] Tests : `vitest run` — 5 fichiers / 24 tests PASS
- [ ] Playwright E2E (`npm run test:e2e`) — non lancé cette passe
- [ ] Sécurité (`npm run test:security`) — non lancé cette passe
- [ ] IA live (`npm run test:ai-live`) — appels manuels via l'UI admin, budget dépassé (voir QA_REPORT)
- [ ] Build production — bloqué par l'environnement (`ERR_SWC_NATIVE_CACHE`), pas par le code

## Vérifié manuellement (navigateur + base)
- [x] Auth : connexion, déconnexion, changement de mot de passe + invalidation de session
- [x] Profil : édition, avatar réel, préférences de notifications
- [x] Adresses : création, édition, défaut, suppression
- [x] Notifications : liste réelle, lecture unitaire, tout marquer comme lu
- [x] Messagerie : ouverture de conversation, envoi client → vendeur et vendeur → client, marquage lu
- [x] Onboarding vendeur : 4 étapes, upload 3 documents, RIB chiffré, soumission, notifications admins
- [x] Statut d'onboarding : EN_ATTENTE (date réelle), REFUSE (bandeau motif), VERIFIE (dates réelles)
- [x] Boutique : logo/bannière, accent, région, horaires, aperçu en direct
- [x] RIB vendeur : modification chiffrée + retour en vérification
- [x] Pause / reprise / fermeture boutique
- [x] Admin : dashboard, liste, dossier, analyse IA, validation, refus motivé, complément
- [x] Analyse IA : extraction CIN/RNE/patente exacte (Gemini), dates expirées et types erronés détectés
- [x] Modération : libellés français, traitement avec note
- [x] Paramètres plateforme : enregistrement, persistance après reload, audit avant/après
- [x] Catalogue : fiche produit et carte vendeur (identifiants de vitrine) sans erreur serveur
- [x] Contact vendeur non rattaché : message explicite, pas d'erreur technique

## Corrections clés de la passe
1. Garde ObjectId sur `getFournisseur` / `estFournisseurVerifie` + repli vitrine → fin des `CastError` sur les fiches produit.
2. Message métier pour la messagerie d'une fiche non rattachée (`FOURNISSEUR_HORS_LIGNE`).
3. `soumisLe` réel (modèle, service, seed, mapper) → écran de vérification crédible et cohérent.
4. Seed : notifications et audits métier, documents légaux avec analyse IA, notes/avis/ventes réalistes.
5. `demanderComplement` protégé par `requireRole()` (admin).
6. Revalidation des pages dossier après décision admin.
7. Nettoyage des imports morts (lint 17 → 7 warnings), toast par défaut sans « démo ».
8. Dates d'expiration françaises (`JJ/MM/AAAA`) : parseur dédié + tests → « Document expiré » remonte enfin.
9. Comparaison du titulaire corrigée : CIN → gérant, RNE/patente → raison sociale (fin des faux positifs).
10. Modèle vision changé (`gemini-2.5-flash`, `max_tokens: 700`) : numéros exacts, ~1,6 k tokens par dossier.
11. Seed : documents réellement lisibles pour les boutiques vérifiées ; spécimens illisibles pour les autres.

## Blocages
- Google OAuth : identifiants absents (`.env.local`).
- Gmail : 2 envois réels vers une boîte possédée à faire (SMTP configuré).
- Git : dossier non versionné → branche/commits impossibles.
- Windows + SWC : `next build` impossible dans cet environnement.

## Redémarrage dev
Après modification d'un modèle Mongoose, redémarrer `npm run dev` (les modèles sont mis en cache dans le processus).
Un `npm run seed:reset` invalide toutes les sessions : se reconnecter avec `SeedPass123!`.
