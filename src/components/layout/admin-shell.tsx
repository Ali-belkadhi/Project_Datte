"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LogoutButton } from "@/components/shared/logout-button";
import { adminNav, isActive } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Shell admin : sidebar sobre (fond night, texte cream) ; onglets défilants sur mobile. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-hidden bg-night text-cream lg:flex">
        <PalmPattern className="text-cream" opacity={0.05} />
        <div className="relative flex h-[72px] items-center gap-2 px-5">
          <Logo tone="light" href="/admin" />
          <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">Admin</span>
        </div>
        <nav aria-label="Navigation admin" className="relative flex-1 space-y-1 px-3 py-2">
          {adminNav.map((item) => {
            const actif = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream",
                  actif && "bg-cream/10 text-brand-light",
                )}
              >
                <item.icon className="size-[18px]" aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="rounded-full bg-brand-light px-1.5 text-[11px] font-bold text-night">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="relative space-y-3 border-t border-cream/10 p-4">
          <ThemeToggle tone="dark" />
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-brand-light text-[13px] font-bold text-night">DG</span>
            <span>
              <span className="block text-sm font-semibold">Équipe DEGLA</span>
              <span className="block text-[12px] text-cream/60">Super-administrateur</span>
            </span>
          </div>
          <LogoutButton tone="dark" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-night text-cream lg:hidden">
          <div className="flex h-14 items-center gap-2 px-4">
            <Logo tone="light" href="/admin" />
            <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">Admin</span>
          </div>
          <nav aria-label="Navigation admin" className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-2">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-cream/70",
                  isActive(pathname, item) && "bg-cream/10 text-brand-light",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main id="contenu" className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
