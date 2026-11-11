# Contribuer à DEGLA

## Branches

- `feat/A-…` (Comptes), `feat/B-…` (Catalogue), `feat/C-…` (Commandes) — ex. `feat/B-meshy-webhook`
- `fix/…` pour les corrections, `chore/…` pour l'outillage, `docs/…` pour la documentation
- `main` est protégée : on y entre uniquement par pull request.

## Commits conventionnels

```
feat(catalogue): brancher le webhook Meshy
fix(commandes): arrondir le sous-total au millime
docs(architecture): préciser les règles d'import
```

Types : `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`. Portée : `comptes`, `catalogue`, `commandes`, `commun`, `3d`, `design`.

## Revue

Chaque pull request est relue par **un membre d'un autre module** (voir `.github/CODEOWNERS`). On vérifie en particulier les règles d'architecture de `docs/architecture.md` : pas d'import entre modules `features/`, pas d'import interne entre modules serveur (passer par `server/contracts`), pas d'accès à `src/mocks` hors repositories `*.mock.ts`.

## Définition de « terminé »

- [ ] Rendu vérifié sur mobile (390 px) **et** desktop (1440 px), en mode clair et sombre
- [ ] États de chargement (`loading.tsx`), vide (illustration + action) et d'erreur présents
- [ ] Accessibilité : cibles ≥ 44 px, focus visible, `aria-label` sur les boutons-icônes, propriétés logiques (`ms-`, `pe-`…)
- [ ] Aucune couleur codée en dur (tokens uniquement, sauf `components/three/presets.ts`)
- [ ] Textes en français, au vouvoiement ; prix en DT avec 3 décimales (dattes au kilo, dérivés à l'unité)
- [ ] `npm run typecheck` et `npm run lint` verts, `npm run build` réussi

## À venir

Husky (hooks pre-commit), tests (Vitest + Playwright) et `next-intl` (FR / AR / EN) seront ajoutés plus tard : leurs emplacements sont prévus dans la documentation.
