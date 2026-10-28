import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Petit badge « IA » (étincelle, fond brand-soft) qui signale les fonctionnalités d'IA. */
export function AiBadge({ label = "IA", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-full bg-brand-soft px-2 text-[11px] font-bold tracking-wide text-accent-foreground uppercase", className)}>
      <Sparkles className="size-3" aria-hidden />
      {label}
    </span>
  );
}
