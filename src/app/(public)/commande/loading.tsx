import { Skeleton } from "@/components/ui/skeleton";

export default function CommandeLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 md:py-12" aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
