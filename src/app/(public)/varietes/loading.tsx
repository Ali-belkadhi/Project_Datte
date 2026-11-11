import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function VarietesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 md:py-12" aria-busy="true" aria-label="Chargement">
      <PageHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Skeleton className="aspect-[16/8] rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-60 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
