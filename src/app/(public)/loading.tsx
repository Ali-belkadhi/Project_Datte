import { Skeleton } from "@/components/ui/skeleton";

/** Squelette de l'accueil : hero sombre + bandeau + grille. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className="bg-hero">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:px-6 lg:grid-cols-2 lg:py-24">
          <div className="space-y-5">
            <Skeleton className="h-3 w-48 bg-cream/10" />
            <Skeleton className="h-16 w-full bg-cream/10 md:h-24" />
            <Skeleton className="h-16 w-4/5 bg-cream/10" />
            <Skeleton className="h-14 w-full max-w-xl rounded-full bg-cream/10" />
          </div>
          <Skeleton className="h-72 rounded-full bg-cream/5 lg:h-[460px]" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-12 md:grid-cols-4 md:px-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
