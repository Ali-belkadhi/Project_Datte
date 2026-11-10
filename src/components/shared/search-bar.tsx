"use client";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  placeholder?: string;
  /** Si fourni, la barre est un bouton qui ouvre la palette ⌘K. */
  onOpen?: () => void;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  tone?: "default" | "dark";
  size?: "default" | "lg";
  autoFocus?: boolean;
  className?: string;
};

/** Champ arrondi avec icône, raccourci ⌘K sur desktop. */
export function SearchBar({
  placeholder = "Deglet Nour, rob, coffret…",
  onOpen,
  value,
  onChange,
  onSubmit,
  tone = "default",
  size = "default",
  autoFocus,
  className,
}: SearchBarProps) {
  const base = cn(
    "group flex w-full items-center gap-2.5 rounded-full border ps-4 pe-2 text-start transition-colors",
    size === "lg" ? "h-14 text-base" : "h-11 text-[15px]",
    tone === "dark"
      ? "border-cream/15 bg-cream/10 text-cream placeholder:text-cream/60 backdrop-blur hover:bg-cream/15"
      : "bg-card hover:border-ring/50",
    className,
  );
  const kbd = (
    <kbd
      className={cn(
        "ms-auto hidden h-7 items-center rounded-full border px-2.5 font-mono text-[11px] lg:inline-flex",
        tone === "dark" ? "border-cream/20 text-cream/70" : "text-muted-foreground",
      )}
    >
      ⌘K
    </kbd>
  );
  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={base} aria-label="Rechercher sur DEGLA">
        <Search className={cn("size-4 shrink-0", tone === "dark" ? "text-cream/70" : "text-muted-foreground")} aria-hidden />
        <span className={cn("truncate", tone === "dark" ? "text-cream/70" : "text-muted-foreground")}>{placeholder}</span>
        {kbd}
      </button>
    );
  }
  return (
    <form
      role="search"
      className={base}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value ?? "");
      }}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Rechercher"
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}
