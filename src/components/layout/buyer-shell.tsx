import type { LignePanier } from "@/types/domain";
import { BottomNav } from "./bottom-nav";
import { BuyerHeader } from "./buyer-header";
import { DemoHydrator } from "./demo-hydrator";
import { Footer } from "./footer";
import { FooterGate } from "./footer-gate";
import type { SearchIndex } from "./search-command";

/** Shell de la vue acheteur : en-tête, contenu, pied de page, bottom nav mobile. */
export function BuyerShell({
  children,
  index,
  panier,
  favoris,
}: {
  children: React.ReactNode;
  index: SearchIndex;
  panier: LignePanier[];
  favoris: string[];
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[70] focus:rounded-xl focus:bg-card focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <DemoHydrator panier={panier} favoris={favoris} />
      <BuyerHeader index={index} />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <FooterGate>
        <Footer />
      </FooterGate>
      <BottomNav />
    </div>
  );
}
