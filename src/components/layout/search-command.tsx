"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Store, TrendingUp } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import type { VarieteSlug } from "@/types/domain";

export type SearchIndex = {
  varietes: { label: string; sous: string; href: string; variete?: VarieteSlug }[];
  produits: { label: string; sous: string; href: string; variete?: VarieteSlug }[];
  boutiques: { label: string; sous: string; href: string }[];
  populaires: string[];
};

/** Palette de recherche ⌘K (même UI que /recherche). Filtrage en mémoire par cmdk. */
export function SearchCommand({ index, open, onOpenChange }: { index: SearchIndex; open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const aller = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Rechercher sur DEGLA" description="Variétés, produits et boutiques">
      <CommandInput placeholder="Deglet Nour, rob, coffret, Tozeur…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Aucun résultat. Essayez « Medjool » ou « rob ».</CommandEmpty>
        <CommandGroup heading="Recherches populaires">
          {index.populaires.map((q) => (
            <CommandItem key={q} value={`populaire ${q}`} onSelect={() => aller(`/recherche?q=${encodeURIComponent(q)}`)}>
              <TrendingUp className="text-muted-foreground" />
              {q}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Variétés">
          {index.varietes.map((v) => (
            <CommandItem key={v.href} value={`variete ${v.label} ${v.sous}`} onSelect={() => aller(v.href)}>
              {v.variete ? <VarietyGlyph variete={v.variete} className="size-5" /> : <Search />}
              <span>{v.label}</span>
              <span className="ms-auto text-[12px] text-muted-foreground">{v.sous}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Produits">
          {index.produits.map((p) => (
            <CommandItem key={p.href} value={`produit ${p.label} ${p.sous}`} onSelect={() => aller(p.href)}>
              {p.variete ? <VarietyGlyph variete={p.variete} className="size-5" /> : <Search />}
              <span className="truncate">{p.label}</span>
              <span className="ms-auto shrink-0 text-[12px] text-muted-foreground">{p.sous}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Boutiques">
          {index.boutiques.map((b) => (
            <CommandItem key={b.href} value={`boutique ${b.label} ${b.sous}`} onSelect={() => aller(b.href)}>
              <Store className="text-muted-foreground" />
              <span>{b.label}</span>
              <span className="ms-auto text-[12px] text-muted-foreground">{b.sous}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
