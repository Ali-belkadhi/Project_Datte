"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Store, TrendingUp } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { ProductPhoto } from "@/components/illustrations/product-photo";
import { formatPrix } from "@/lib/format";
import type { VarieteSlug } from "@/types/domain";

type SuggestionResponse = {
  varietes: { slug: string; nom: string; origine: string }[];
  produits: {
    id: string;
    slug: string;
    nom: string;
    prix: number;
    typeProduit: string;
    variete?: string;
    photo?: string;
    vendeur: string;
  }[];
  boutiques: { id: string; slug: string; nom: string; ville: string }[];
};

/** Champ de recherche avec suggestions en direct pendant la saisie. */
export function SearchInput({ initial, populaires }: { initial: string; populaires: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [chargement, setChargement] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const aller = (v: string) => {
    setOuvert(false);
    router.replace(v ? `/recherche?q=${encodeURIComponent(v)}` : "/recherche", { scroll: false });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const terme = q.trim();
    if (terme.length < 2) {
      setSuggestions(null);
      setChargement(false);
      return;
    }

    setChargement(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recherche/suggestions?q=${encodeURIComponent(terme)}`);
        if (res.ok) {
          const data = (await res.json()) as SuggestionResponse;
          setSuggestions(data);
          setOuvert(true);
        }
      } catch (err) {
        console.warn("Erreur suggestions:", err);
      } finally {
        setChargement(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [q]);

  const aDesResultats =
    suggestions &&
    (suggestions.varietes.length > 0 || suggestions.produits.length > 0 || suggestions.boutiques.length > 0);

  return (
    <div ref={conteneurRef} className="relative space-y-4">
      <div className="relative">
        <SearchBar
          size="lg"
          value={q}
          onChange={(val) => {
            setQ(val);
            if (val.trim().length >= 2) setOuvert(true);
          }}
          onSubmit={aller}
          autoFocus
          placeholder="Variété, produit, boutique, ville…"
        />
        {chargement && (
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </span>
        )}
      </div>

      {/* Dropdown de suggestions en direct */}
      {ouvert && aDesResultats && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[440px] overflow-y-auto rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur-md">
          {suggestions.varietes.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Variétés</p>
              <ul className="space-y-1">
                {suggestions.varietes.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/variete/${v.slug}`}
                      onClick={() => setOuvert(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold hover:bg-accent"
                    >
                      <VarietyGlyph variete={(v.slug as VarieteSlug) || "deglet-nour"} className="size-6" />
                      <span>{v.nom}</span>
                      <span className="text-xs text-muted-foreground">· {v.origine}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.produits.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produits</p>
              <ul className="space-y-1">
                {suggestions.produits.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/produit/${p.slug}`}
                      onClick={() => setOuvert(false)}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {p.photo ? (
                            <ProductPhoto
                              src={p.photo}
                              alt={p.nom}
                              className="size-full object-cover"
                              fallback={<VarietyGlyph variete={(p.variete as VarieteSlug) || "deglet-nour"} className="size-full p-1" />}
                            />
                          ) : (
                            <VarietyGlyph variete={(p.variete as VarieteSlug) || "deglet-nour"} className="size-full p-1" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.nom}</p>
                          <p className="text-xs text-muted-foreground">{p.vendeur}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatPrix(p.prix)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.boutiques.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Boutiques</p>
              <ul className="space-y-1">
                {suggestions.boutiques.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/boutique/${b.slug}`}
                      onClick={() => setOuvert(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm font-semibold hover:bg-accent"
                    >
                      <Store className="size-4 text-accent-foreground" />
                      <span>{b.nom}</span>
                      <span className="text-xs text-muted-foreground">· {b.ville}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 border-t pt-2">
            <button
              type="button"
              onClick={() => aller(q)}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-brand hover:bg-brand-soft"
            >
              <span>Voir tous les résultats pour « {q} »</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recherches populaires */}
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
