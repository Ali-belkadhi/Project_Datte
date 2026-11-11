# Prisma — schéma DEGLA

`schema.prisma` contient les **38 modèles** et toutes les énumérations de l'annexe A. Il est validé (`npx prisma validate`) mais **jamais migré** dans le template : aucune connexion n'est ouverte et `@prisma/client` n'est pas installé.

Conventions : `id String @default(cuid())`, `creeLe` / `modifieLe` partout, montants en millimes (`Int`), poids en grammes (`Int`). L'héritage `Produit` → `ProduitDatte` / `ProduitDerive` utilise le discriminant `typeProduit` et deux tables 1-1 (clé primaire = `produitId`).

## Brancher PostgreSQL (plus tard)

```bash
npm i @prisma/client @prisma/adapter-pg
# .env.local
DATABASE_URL="postgresql://degla:degla@localhost:5432/degla"

npx prisma migrate dev --name init   # crée la base et le client (src/generated/prisma)
npx prisma db seed                   # à écrire : prisma/seed.ts à partir de src/mocks
```

Puis décommenter `src/server/core/db.ts` et créer les repositories `*.repository.prisma.ts` (voir `docs/backend.md`).

L'URL est lue dans `prisma.config.ts` (Prisma 7). Sa valeur de repli ne sert qu'à `prisma format` / `prisma validate`.
