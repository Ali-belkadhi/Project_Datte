import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand";

export const dynamic = "force-static";
export const metadata = { title: "Hors ligne" };

/** Page de secours affichée par le Service Worker quand une page n'est pas en cache et qu'il n'y a pas de réseau. */
export default function HorsLignePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <Logo className="mx-auto h-9 w-auto" />
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-soft text-accent-foreground">
          <WifiOff className="size-8" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-semibold">Vous êtes hors ligne</h1>
        <p className="text-muted-foreground">
          Cette page n&apos;a pas encore été consultée sur cet appareil. Les pages déjà visitées (catalogue, fiches produit, panier) restent disponibles sans réseau. Le paiement et la commande nécessitent une connexion.
        </p>
        <Button asChild variant="brand" size="lg">
          <Link href="/">Réessayer</Link>
        </Button>
      </div>
    </main>
  );
}
