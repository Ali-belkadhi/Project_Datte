import { cn } from "@/lib/utils";
import { SHOP_TINTS } from "@/lib/constants";
import type { ShopTint } from "@/types/domain";

/** Avatar de boutique : initiales sur la teinte d'accent du vendeur. */
export function ShopAvatar({ nom, couleur, size = "md", className }: { nom: string; couleur: ShopTint; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const initiales = nom
    .replace(/^(Palmeraie|Coopérative|Les|Maison|Dattes du|Ferme)\s+/i, "")
    .split(/\s+/)
    .filter((m) => m.length > 2)
    .slice(0, 2)
    .map((m) => m[0]!.toUpperCase())
    .join("");
  const t = SHOP_TINTS[couleur];
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold",
        t.bg,
        t.text,
        size === "sm" && "size-8 text-[12px]",
        size === "md" && "size-11 text-sm",
        size === "lg" && "size-14 text-lg",
        size === "xl" && "size-20 text-2xl ring-4 ring-card",
        className,
      )}
    >
      {initiales || nom[0]}
    </span>
  );
}
