# DEGLA — Instructions pour les Agents

## Architecture du Projet
- Ce projet utilise Next.js (App Router) avec structure **sans `src/`**.
- Les dossiers principaux sont situés directement à la racine :
  - `app/` : Pages et routing (App Router)
  - `components/` : Composants UI réutilisables (shadcn/ui, layout, 3D)
  - `lib/` : Utilitaires et fonctions d'API / mock
  - `hooks/` : Hooks React personnalisés
  - `store/` : Stores Zustand (panier, UI, wishlist)
  - `types/` : Définitions TypeScript
  - `data/` : Données mock catalogue
  - `styles/` : Fichiers CSS globaux
  - `public/` : Assets statiques et images
