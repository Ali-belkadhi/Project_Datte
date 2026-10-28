import { Skeleton } from "@/components/ui/skeleton";

export default function AssistantLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6" aria-busy="true" aria-label="Chargement de l'assistant">
      <Skeleton className="h-14 rounded-2xl" />
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="mx-auto h-8 w-80" />
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-56 rounded-full" />
        ))}
      </div>
    </div>
  );
}
