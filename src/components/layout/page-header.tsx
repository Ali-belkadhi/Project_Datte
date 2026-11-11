import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  surtitre?: string;
  titre: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  fil?: Crumb[];
  className?: string;
};

/** Sur-titre, titre, description, actions à droite, fil d'Ariane optionnel. */
export function PageHeader({ surtitre, titre, description, actions, fil, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {fil && <Breadcrumbs items={fil} />}
        {surtitre && <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">{surtitre}</p>}
        <h1 className="font-display text-3xl font-semibold text-balance md:text-4xl">{titre}</h1>
        {description && <div className="max-w-2xl text-[15px] text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("text-[13px] text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 opacity-60 rtl:rotate-180" aria-hidden />}
            {c.href ? (
              <Link href={c.href} className="rounded hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-foreground">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
