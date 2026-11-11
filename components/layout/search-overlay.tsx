"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import { searchProducts } from "@/lib/api/products";
import { categories } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useLockBody } from "@/hooks/use-client";
import { useUIStore } from "@/store/ui-store";
import { ProductMedia } from "@/components/products/product-media";

const SUGGESTIONS = ["Coffret", "Sirop", "Deglet Nour", "Café", "Fourrées"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => searchProducts(query), [query]);
  useLockBody(searchOpen);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
    else setQuery("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const goToResults = () => {
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/produits?q=${encodeURIComponent(query.trim())}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    goToResults();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Recherche"
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-forest-950/55 backdrop-blur-md" onClick={() => setSearchOpen(false)} />
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-grain relative mx-auto mt-0 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-b-3xl bg-cream p-5 shadow-lux sm:mt-16 sm:rounded-3xl sm:p-8"
          >
            <form onSubmit={submit} className="flex items-center gap-3 border-b border-forest/15 pb-4">
              <Search className="size-5 text-gold" />
              <input
                id="search-input"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit, un coffret…"
                className="flex-1 bg-transparent font-serif text-2xl text-forest placeholder:text-forest/35 focus:outline-none sm:text-3xl"
                autoComplete="off"
              />
              <button
                type="button"
                aria-label="Fermer la recherche"
                onClick={() => setSearchOpen(false)}
                className="flex size-10 items-center justify-center rounded-full bg-forest/5 text-forest hover:bg-forest/10"
              >
                <X className="size-5" />
              </button>
            </form>

            {!query && (
              <div className="pt-6">
                <p className="eyebrow mb-3">Recherches populaires</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="rounded-full border border-forest/15 px-4 py-2 text-sm text-forest transition-colors hover:border-gold hover:bg-gold/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="eyebrow mb-3 mt-8">Catégories</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/produits?categorie=${c.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="rounded-xl bg-beige/40 px-4 py-3 text-sm text-forest transition-colors hover:bg-beige"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {query && (
              <div className="pt-4">
                {results.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-serif text-2xl text-forest">Aucun résultat pour « {query} »</p>
                    <p className="mt-2 text-sm text-muted">Essayez « dattes », « sirop » ou « coffret ».</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-forest/10">
                    {results.map((p, i) => (
                      <motion.li
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
                          href={`/produits/${p.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="group flex items-center gap-4 py-3"
                        >
                          <ProductMedia
                            src={p.images[0].src}
                            alt={p.images[0].alt}
                            sizes="64px"
                            className="size-16 shrink-0 rounded-xl"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-lg text-forest">{p.name}</p>
                            <p className="text-xs text-muted">{p.subtitle}</p>
                          </div>
                          <span className="text-sm font-semibold text-forest">{formatPrice(p.price)}</span>
                          <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                )}
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={goToResults}
                    className="mt-4 text-sm font-medium text-gold-dark hover:underline"
                  >
                    Voir tous les résultats →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
