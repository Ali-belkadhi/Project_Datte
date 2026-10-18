"use client";
import { Suspense, useMemo } from "react";
import { Center, useGLTF } from "@react-three/drei";
import type { ModelSource } from "./model-source";
import { PRODUCT_TINTS, VARIETY_PRESETS } from "../presets";
import { Bottle } from "./bottle";
import { DateCluster } from "./date-cluster";
import { DateFruit } from "./date-fruit";
import { DatePile } from "./date-pile";
import { GiftBox } from "./gift-box";
import { Jar } from "./jar";
import { Pouch } from "./pouch";

type Props = { source: ModelSource; wireframe?: boolean; animate?: boolean };

/**
 * Choisit le rendu selon `source.kind`. Les pages ne connaissent que ModelSource :
 * passer de la 3D procédurale aux GLB Meshy ne change aucune page.
 */
export function ModelFromSource({ source, wireframe = false, animate = true }: Props) {
  if (source.kind === "glb") {
    return (
      <Suspense fallback={null}>
        <GlbModel url={source.url} />
      </Suspense>
    );
  }
  if (source.kind === "procedural-date") {
    const { variete, arrangement } = source;
    if (arrangement === "pile") return <DatePile variete={variete} wireframe={wireframe} />;
    if (arrangement === "box") return <GiftBox variete={variete} wireframe={wireframe} />;
    if (arrangement === "cluster")
      return (
        <group position={[0, -0.05, 0]} scale={0.95}>
          <DateCluster variete={variete} sway={animate} wireframe={wireframe} />
        </group>
      );
    const len = VARIETY_PRESETS[variete].shape.length;
    return <DateFruit variete={variete} seed={3} size={0.9 / len} position={[0, 0.9, 0]} rotation={[0.15, 0, 0.35]} wireframe={wireframe} />;
  }
  // procedural-product
  const teinte = source.teinte ?? teinteParDefaut(source.etiquette);
  switch (source.produit) {
    case "bocal":
      return <Jar teinte={teinte} etiquette={source.etiquette} wireframe={wireframe} />;
    case "bouteille":
      return <Bottle teinte={teinte} etiquette={source.etiquette} wireframe={wireframe} />;
    case "sachet":
      return <Pouch etiquette={source.etiquette} wireframe={wireframe} />;
    case "boite":
      return <GiftBox variete={source.variete ?? "deglet-nour"} etiquette={source.etiquette} wireframe={wireframe} />;
  }
}

function teinteParDefaut(etiquette: string) {
  const e = etiquette.toLowerCase();
  if (e.includes("rob")) return PRODUCT_TINTS.rob;
  if (e.includes("miel")) return PRODUCT_TINTS.miel;
  if (e.includes("pâte") || e.includes("pate")) return PRODUCT_TINTS.pate;
  if (e.includes("jus")) return PRODUCT_TINTS.jus;
  return PRODUCT_TINTS.confiture;
}

/** Futur : modèle Meshy (GLB). Implémenté mais non utilisé par les données de démonstration. */
function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return (
    <Center top>
      <primitive object={clone} />
    </Center>
  );
}
