"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeChoice } from "@/hooks/use-theme";
import { useMounted } from "@/hooks/use-mounted";

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Système", icon: Monitor },
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
];

/** Système / Clair / Sombre. `tone="dark"` pour le pied de page. */
export function ThemeToggle({ tone = "default", showLabels = false, className }: { tone?: "default" | "dark"; showLabels?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const courant = mounted ? theme : "system";
  return (
    <div
      role="radiogroup"
      aria-label="Thème"
      className={cn("inline-flex rounded-full border p-1", tone === "dark" ? "border-cream/15 bg-cream/5" : "bg-card", className)}
    >
      {OPTIONS.map((o) => {
        const actif = courant === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={actif}
            aria-label={o.label}
            onClick={() => setTheme(o.value)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors",
              tone === "dark"
                ? actif
                  ? "bg-cream text-night"
                  : "text-cream/70 hover:text-cream"
                : actif
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <o.icon className="size-4" aria-hidden />
            {showLabels && o.label}
          </button>
        );
      })}
    </div>
  );
}
