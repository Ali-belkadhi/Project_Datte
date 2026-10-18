import { cn } from "@/lib/utils";

/** Petite datte décorative (puces, séparateurs éditoriaux). */
export function DateMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 16" aria-hidden className={cn("inline-block h-3.5 w-2.5", className)}>
      <ellipse cx="6" cy="9" rx="4.6" ry="6.4" fill="var(--brand-fill)" />
      <ellipse cx="4.4" cy="7" rx="1" ry="2.4" fill="var(--cream)" opacity="0.6" />
      <path d="M3.5 3.2c.8-1.4 1.6-2 2.5-2s1.7.6 2.5 2" fill="var(--brand-light)" />
    </svg>
  );
}
