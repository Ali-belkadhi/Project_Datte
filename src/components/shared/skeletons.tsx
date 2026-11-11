import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Squelettes réutilisables, fidèles aux mises en page. */

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ n = 8, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4", className)}>
      {Array.from({ length: n }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}

export function ListSkeleton({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export function StatsSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

/** Squelette générique de page de tableau de bord (vendeur / admin). */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement">
      <PageHeaderSkeleton />
      <StatsSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <ListSkeleton n={4} />
    </div>
  );
}
