"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buyerBottomNav, isActive, type NavItem } from "@/config/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Barre de navigation basse (mobile) — fond translucide, zone de sécurité iOS.
 * `items` permet de la réutiliser côté vendeur ; `extra` ajoute un bouton (ex. « Plus »).
 */
export function BottomNav({ items = buyerBottomNav, extra, label = "Navigation mobile" }: { items?: (NavItem & { featured?: boolean })[]; extra?: React.ReactNode; label?: string }) {
  const pathname = usePathname();
  const count = useCartStore((s) => s.lignes.length);
  const mounted = useMounted();
  return (
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/85 pb-safe backdrop-blur-xl lg:hidden print:hidden">
      <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
        {items.map((item) => {
          const actif = isActive(pathname, item);
          if (item.featured) {
            return (
              <li key={item.href} className="flex flex-1 items-center justify-center">
                <Link
                  href={item.href}
                  aria-current={actif ? "page" : undefined}
                  className="-mt-6 flex flex-col items-center gap-1 text-[11px] font-semibold"
                >
                  <span className={cn("grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift ring-4 ring-background", actif && "bg-brand text-brand-foreground")}>
                    <item.icon className="size-6" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground transition-colors",
                  actif && "text-foreground",
                )}
              >
                <item.icon className={cn("size-5", actif && "text-brand")} aria-hidden />
                {item.label}
                {item.href === "/panier" && mounted && count > 0 && (
                  <span className="absolute top-2 start-[calc(50%+4px)] grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground">
                    {count}
                  </span>
                )}
                {actif && <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-fill" />}
              </Link>
            </li>
          );
        })}
        {extra && <li className="flex flex-1">{extra}</li>}
      </ul>
    </nav>
  );
}
