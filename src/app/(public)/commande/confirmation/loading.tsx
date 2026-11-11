import { Skeleton } from "@/components/ui/skeleton";

export default function ConfirmationLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-16 text-center" aria-busy="true" aria-label="Chargement">
      <Skeleton className="mx-auto size-24 rounded-full" />
      <Skeleton className="mx-auto h-12 w-64" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
    </div>
  );
}
