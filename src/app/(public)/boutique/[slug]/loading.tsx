import { Skeleton } from "@/components/ui/skeleton";
import { GridSkeleton } from "@/components/shared/skeletons";

export default function BoutiqueLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6 md:py-10" aria-busy="true" aria-label="Chargement de la boutique">
      <Skeleton className="h-4 w-60" />
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-11 w-80 rounded-xl" />
      <GridSkeleton n={8} />
    </div>
  );
}
