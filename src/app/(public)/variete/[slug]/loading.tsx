import { Skeleton } from "@/components/ui/skeleton";
import { GridSkeleton } from "@/components/shared/skeletons";

export default function VarieteLoading() {
  return (
    <div aria-busy="true" aria-label="Chargement de la variété">
      <div className="bg-hero">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:px-6 lg:grid-cols-2 lg:py-20">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48 bg-cream/10" />
            <Skeleton className="h-20 w-3/4 bg-cream/10" />
            <Skeleton className="h-24 w-full bg-cream/10" />
          </div>
          <Skeleton className="h-72 rounded-full bg-cream/5" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <GridSkeleton n={4} />
      </div>
    </div>
  );
}
