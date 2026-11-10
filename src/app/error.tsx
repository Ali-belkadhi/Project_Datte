"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Erreur — sobre, avec « Réessayer ». */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="contenu" className="grid min-h-[70dvh] place-items-center px-4 py-16">
      <div className="mx-auto max-w-md space-y-5 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger">
          <TriangleAlert className="size-7" aria-hidden />
        </span>
        <h1 className="font-display text-3xl font-semibold">Une erreur inattendue est survenue.</h1>
        <p className="text-muted-foreground">Nous n&apos;avons pas pu afficher cette page. Réessayez dans un instant.</p>
        {error.digest && <p className="font-mono text-[12px] text-muted-foreground">Réf. {error.digest}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="brand" onClick={reset}>
            <RotateCcw aria-hidden /> Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Accueil</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
