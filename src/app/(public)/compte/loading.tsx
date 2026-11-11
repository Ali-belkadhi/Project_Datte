import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function CompteLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement">
      <PageHeaderSkeleton />
      <Skeleton className="h-40 rounded-2xl" />
      <ListSkeleton n={3} />
    </div>
  );
}
