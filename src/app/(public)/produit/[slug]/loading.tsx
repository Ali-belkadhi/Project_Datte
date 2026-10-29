import { Skeleton } from "@/components/ui/skeleton";

export default function ProduitLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 pb-24 md:px-6 md:pt-8" aria-busy="true" aria-label="Chargement du produit">
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="space-y-3">
          <Skeleton className="h-11 w-56 rounded-xl" />
          <Skeleton className="aspect-square rounded-3xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
