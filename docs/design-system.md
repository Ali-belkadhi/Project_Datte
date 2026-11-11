# Design system — « Oasis contemporaine »

Voir la page vivante **`/design`** (palette, typographie, composants, illustrations, 3D, états).

## Tokens

Définis dans `src/app/globals.css` (mode clair `:root`, mode sombre `.dark`) et exposés à Tailwind v4 par `@theme inline` : `background`, `foreground`, `card`, `primary` (ink), `brand` (amber-700), `brand-fill` (amber-500), `brand-light` (amber-300), `brand-soft` (amber-100), `success` (palm), `danger` (clay), `night`, `cream`, `date`, `sand`, `chart-1…5`, ombres `shadow-soft` / `shadow-lift`, easing `ease-(--ease-degla)`.

**Règles**
- `amber-500` (`brand-fill`) n'est jamais utilisé pour du texte de moins de 18 px : utiliser `text-brand` (amber-700).
- Aucune couleur codée en dur dans les composants. Seule exception : `src/components/three/presets.ts` (3D + illustrations SVG). La page `/design` affiche les valeurs hex de la palette.
- Propriétés logiques (`ms-`, `pe-`, `start-`, `end-`) pour préparer l'arabe (RTL).

## Typographie

Fraunces (`font-display`, titres, prix, grands chiffres) · Inter (`font-sans`, interface) · JetBrains Mono (`font-mono`, numéros de commande).

| Rôle | Classe |
| --- | --- |
| Display hero | `font-display text-5xl md:text-7xl font-semibold leading-[0.95]` |
| H1 page | `font-display text-3xl md:text-4xl font-semibold` |
| H2 section | `font-display text-2xl md:text-3xl font-semibold` |
| Sur-titre | `text-[11px] font-semibold uppercase tracking-[0.16em] text-brand` |
| Prix | `PriceTag` (Fraunces, unité muted) |

## Formes et mouvement

Cartes `rounded-2xl` avec bordure, `shadow-lift` + `-translate-y-0.5` au survol · boutons et champs `rounded-xl`, hauteur ≥ 44 px · badges et chips `rounded-full` · sections `py-12 md:py-20` · animations `motion/react` 150–300 ms, easing `[0.22, 1, 0.36, 1]`, toutes désactivées avec `prefers-reduced-motion`.

## Composants

- `components/ui` : shadcn/ui retouché (variante `brand` et `outline-light` du bouton, badges `brand/success/danger/night`, tailles 44 px).
- `components/brand` : `Logo` (full / mark / mono), `Monogram`, `PalmPattern`, `DateMark`.
- `components/layout` : `BuyerShell`, `SellerShell`, `AdminShell`, `AuthShell`, `Footer`, `BottomNav`, `PageHeader`, `Section`, `DevViewSwitcher`.
- `components/shared` : `PriceTag`, `WeightPicker`, `QuantityStepper`, `StatusBadge`, `VerifiedBadge`, `RatingStars`, `Timeline`, `StatCard`, `EmptyState`, `FilterChips`, `SearchBar`, `ImageDropzone`, `Stepper`, `SectionReveal`, `Money`, `Weight`, `ThemeToggle`, `AiBadge`, `ProductCard`, `AddressCard`, `ShopHero`, squelettes.
- `components/illustrations` : `ProductIllustration` (vrac, branchée, barquette, boîte, bocal, bouteille, sachet), `VarietyGlyph`, états vides, `OasisScene`, `DocumentIllustration`. Rendu déterministe (seed), aucune image externe.

## Ton

Vouvoiement, phrases courtes, vocabulaire du terroir (« variété », jamais « race »). Prix : « 18,500 DT /kg » pour les dattes, « 9,800 DT » pour les dérivés.
