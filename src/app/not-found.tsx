import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LostDate } from "@/components/illustrations/empty-illustrations";

/** 404 — une datte seule et perdue. */
export default function NotFound() {
  return (
    <main id="contenu" className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <Logo className="justify-center" />
        <div className="mx-auto w-full max-w-sm">
          <LostDate />
        </div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Erreur 404</p>
        <h1 className="font-display text-4xl font-semibold text-balance">Cette page s&apos;est égarée dans la palmeraie.</h1>
        <p className="text-muted-foreground">Le lien est peut-être ancien, ou la page a été déplacée. Revenez sur vos pas : les dattes vous attendent.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="brand" size="lg">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/catalogue">Voir le catalogue</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
