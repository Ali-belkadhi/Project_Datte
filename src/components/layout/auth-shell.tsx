import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { LazyHeroCluster, LazyScene } from "@/components/three";

/** Écran partagé : panneau night avec la grappe 3D (version allégée) + citation, formulaire à droite. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-hero text-cream lg:flex lg:flex-col">
        <PalmPattern className="text-cream" opacity={0.07} />
        <div className="relative z-10 p-10">
          <Logo tone="light" />
        </div>
        <div className="absolute inset-0">
          <LazyScene className="size-full" eager fallback={<div className="mx-auto mt-24 w-80"><ProductIllustration type="branchee" title="Grappe de Deglet Nour" /></div>}>
            <LazyHeroCluster light />
          </LazyScene>
        </div>
        <figure className="relative z-10 mt-auto max-w-md p-10">
          <blockquote className="font-display text-2xl leading-snug font-semibold text-balance">
            « Une datte se cueille à la main, se trie à l&apos;œil et se goûte avec le cœur. »
          </blockquote>
          <figcaption className="mt-3 text-sm text-cream/70">— Dicton des palmeraies du Djérid</figcaption>
        </figure>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 md:px-8 lg:h-20">
          <span className="lg:hidden">
            <Logo />
          </span>
          <Link href="/" className="ms-auto inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> Retour à la boutique
          </Link>
        </header>
        <main id="contenu" className="flex flex-1 items-start justify-center px-4 pt-4 pb-28 md:px-8 lg:items-center lg:pb-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
