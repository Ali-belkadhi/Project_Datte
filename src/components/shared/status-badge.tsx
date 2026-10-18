import { cn } from "@/lib/utils";
import { TONE_CLASSES, type StatusDef } from "@/lib/constants";

/** Statut → libellé + couleur, avec point coloré à gauche. */
export function StatusBadge({ status, className }: { status: StatusDef; className?: string }) {
  const tone = TONE_CLASSES[status.tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold whitespace-nowrap",
        tone.badge,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
      {status.label}
    </span>
  );
}
