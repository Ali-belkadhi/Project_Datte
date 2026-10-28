"use client";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SuggestionChips({ suggestions, onSelect, className, disabled }: { suggestions: string[]; onSelect: (s: string) => void; className?: string; disabled?: boolean }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Suggestions">
      {suggestions.map((s) => (
        <li key={s}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-start text-[13px] font-semibold transition-colors hover:border-brand-fill hover:bg-brand-soft disabled:opacity-50"
          >
            <Sparkles className="size-3.5 shrink-0 text-brand" aria-hidden />
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}
