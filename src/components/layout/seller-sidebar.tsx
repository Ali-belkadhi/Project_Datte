"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isActive, sellerNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

type SellerSidebarProps = {
  replie: boolean;
  onToggle: () => void;
  credits: number;
  vendeur: { nom: string; boutique: string; initiales: string };
};

/** Sidebar vendeur (desktop), repliable. */
export function SellerSidebar({ replie, onToggle, credits, vendeur }: SellerSidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-e bg-sidebar transition-[width] duration-200 lg:flex",
        replie ? "w-[76px]" : "w-64",
      )}
    >
      <div className={cn("flex h-[72px] items-center gap-2 px-4", replie && "justify-center px-0")}>
        <Logo variant={replie ? "mark" : "full"} href={pathname.startsWith("/fournisseur") ? "/fournisseur/produits" : "/vendeur"} />
        {!replie && (
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground uppercase">
            {pathname.startsWith("/fournisseur") ? "Espace fournisseur" : "Espace vendeur"}
          </span>
        )}
      </div>
      <nav aria-label="Navigation vendeur" className="scrollbar-none flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {sellerNav.map((section) => (
          <div key={section.titre} className="space-y-1">
            {!replie && <p className="px-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{section.titre}</p>}
            {section.items.map((item) => {
              const actif = isActive(pathname, item);
              const destHref = pathname.startsWith("/fournisseur") && item.href === "/vendeur/produits" ? "/fournisseur/produits" : item.href;
              const lien = (
                <Link
                  href={destHref}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    actif && "bg-sidebar-accent text-sidebar-accent-foreground",
                    replie && "justify-center px-0",
                  )}
                >
                  <item.icon className="size-[18px] shrink-0" aria-hidden />
                  {!replie && <span className="flex-1">{item.label}</span>}
                  {!replie && item.badge && <span className="rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground">{item.badge}</span>}
                </Link>
              );
              return replie ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{lien}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{lien}</div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="space-y-3 border-t p-3">
        {!replie ? (
          <div className="rounded-2xl bg-night p-4 text-cream">
            <p className="flex items-center gap-2 text-[13px] text-cream/70">
              <Coins className="size-4 text-brand-light" aria-hidden /> Crédits 3D
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{credits}</p>
            <Button asChild size="sm" variant="brand" className="mt-3 w-full">
              <Link href="/vendeur/credits">Recharger</Link>
            </Button>
          </div>
        ) : (
          <Link href="/vendeur/credits" aria-label={`Crédits 3D : ${credits}`} className="mx-auto grid size-11 place-items-center rounded-xl bg-night font-display font-semibold text-brand-light">
            {credits}
          </Link>
        )}
        <div className={cn("flex items-center gap-3", replie && "flex-col")}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-fill font-semibold text-brand-foreground">{vendeur.initiales}</span>
          {!replie && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{vendeur.nom}</span>
              <span className="block truncate text-[12px] text-muted-foreground">{vendeur.boutique}</span>
            </span>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onToggle} aria-label={replie ? "Déplier la barre latérale" : "Replier la barre latérale"}>
            {replie ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
