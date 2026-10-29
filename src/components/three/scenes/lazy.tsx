"use client";
/**
 * Points d'entrée 3D chargés À LA DEMANDE (next/dynamic, ssr: false) + squelette.
 * Les pages et features n'importent que ces composants (jamais les scènes directement).
 */
import dynamic from "next/dynamic";
import { SceneSkeleton } from "../canvas/lazy-scene";

export const LazyHeroCluster = dynamic(() => import("./hero-cluster"), {
  ssr: false,
  loading: () => <SceneSkeleton dark />,
});

export const LazyProductViewer = dynamic(() => import("./product-viewer"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

export const LazySingleDate = dynamic(() => import("./single-date"), {
  ssr: false,
  loading: () => <SceneSkeleton dark />,
});

export const LazyDateLineup = dynamic(() => import("./date-lineup"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});
