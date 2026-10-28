import { cn } from "@/lib/utils";

type EmptyStateProps = {
  illustration?: React.ReactNode;
  titre: string;
  texte?: string;
  action?: React.ReactNode;
  className?: string;
};

/** Illustration SVG + titre + texte + action. */
export function EmptyState({ illustration, titre, texte, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center", className)}>
      {illustration && <div className="mb-2 w-40 max-w-full">{illustration}</div>}
      <h3 className="font-display text-xl font-semibold text-balance">{titre}</h3>
      {texte && <p className="max-w-sm text-[15px] text-muted-foreground text-balance">{texte}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
