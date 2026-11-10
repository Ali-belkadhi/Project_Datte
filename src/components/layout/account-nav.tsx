"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { accountNav, isActive } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Navigation du compte : sidebar sur desktop ; liste en cartes sur l'aperçu mobile, onglets défilants ailleurs. */
export function AccountNav() {
  const pathname = usePathname();
  const surAccueil = pathname === "/compte";
  return (
    <>
      <nav aria-label="Mon compte" className="hidden lg:block">
        <ul className="sticky top-24 space-y-1">
          {accountNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(pathname, item) ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive(pathname, item) && "bg-card text-foreground shadow-soft",
                )}
              >
                <item.icon className="size-[18px]" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {!surAccueil && (
        <nav aria-label="Mon compte" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {accountNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3.5 text-[13px] font-semibold",
                isActive(pathname, item) && "border-primary bg-primary text-primary-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

/** Liste en cartes (mobile, aperçu du compte). */
export function AccountNavCards() {
  return (
    <ul className="grid gap-2 lg:hidden">
      {accountNav.slice(1).map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="flex min-h-14 items-center gap-3 rounded-2xl border bg-card px-4 text-[15px] font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-accent-foreground">
              <item.icon className="size-[18px]" aria-hidden />
            </span>
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
