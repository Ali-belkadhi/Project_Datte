"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/shared/search-bar";

/** Barre de recherche du hero (mène à /recherche?q=…). */
export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <div className="max-w-xl [&_input]:text-foreground">
      <SearchBar
        size="lg"
        value={q}
        onChange={setQ}
        onSubmit={(v) => router.push(v ? `/recherche?q=${encodeURIComponent(v)}` : "/recherche")}
        placeholder="Deglet Nour bio, rob de Gabès, coffret…"
        className="shadow-lift"
      />
    </div>
  );
}
