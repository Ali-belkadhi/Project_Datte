import { Skeleton } from "@/components/ui/skeleton";
import { GridSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function CatalogueLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 md:py-12" aria-busy="true" aria-label="Chargement du catalogue">
      <PageHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
          <GridSkeleton n={9} className="xl:grid-cols-3" />
        </div>
      </div>
    </div>
  );
}
