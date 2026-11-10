import { Skeleton } from "@/components/ui/skeleton";
import { GridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function RechercheLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 md:py-12" aria-busy="true" aria-label="Recherche en cours">
      <PageHeaderSkeleton />
      <Skeleton className="h-14 rounded-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-40 rounded-full" />
        ))}
      </div>
      <GridSkeleton n={8} />
    </div>
  );
}
