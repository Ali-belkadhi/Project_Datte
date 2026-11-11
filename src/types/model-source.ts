/**
 * Source d'un modèle 3D — abstraction partagée par l'UI et la 3D (module B).
 * Réexportée par `components/three/models/model-source.ts`.
 */

export type VarieteSlug =
  | "deglet-nour"
  | "medjool"
  | "alig"
  | "kenta"
  | "khouat-alig"
  | "bessr"
  | "lemsi"
  | "kentichi";

export type ArrangementDatte = "single" | "pile" | "cluster" | "box";
export type ProduitProcedural = "bocal" | "bouteille" | "sachet" | "boite";

export type ModelSource =
  | { kind: "procedural-date"; variete: VarieteSlug; arrangement: ArrangementDatte }
  | {
      kind: "procedural-product";
      produit: ProduitProcedural;
      variete?: VarieteSlug;
      teinte?: string;
      etiquette: string;
    }
  | { kind: "glb"; url: string }; // futur : modèles Meshy (useGLTF) — non utilisé dans le template
