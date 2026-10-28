"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";

/** Champ de la page /recherche (met à jour ?q=…) + recherches populaires. */
export function SearchInput({ initial, populaires }: { initial: string; populaires: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const aller = (v: string) => router.replace(v ? `/recherche?q=${encodeURIComponent(v)}` : "/recherche", { scroll: false });
  return (
    <div className="space-y-4">
      <SearchBar size="lg" value={q} onChange={setQ} onSubmit={aller} autoFocus placeholder="Variété, produit, boutique, ville…" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          <TrendingUp className="size-4" aria-hidden /> Populaires :
        </span>
        {populaires.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setQ(p);
              aller(p);
            }}
            className="h-9 rounded-full border bg-card px-3.5 text-[13px] font-semibold hover:bg-accent"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
