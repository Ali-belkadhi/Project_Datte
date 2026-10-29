"use client";
import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Loader2, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropzoneItem = { id: string; label: string; apercu: React.ReactNode };

type ImageDropzoneProps = {
  items: DropzoneItem[];
  onAdd?: () => void;
  /** Mode réel : reçoit les fichiers choisis (sélecteur ou glisser-déposer). Remplace `onAdd`. */
  onFiles?: (files: File[]) => void;
  /** Envoi en cours : désactive la zone et affiche un indicateur. */
  envoiEnCours?: boolean;
  onRemove?: (id: string) => void;
  onMakePrimary?: (id: string) => void;
  max?: number;
  titre?: string;
  aide?: string;
  compact?: boolean;
  className?: string;
};

/**
 * Zone pointillée + aperçus en grille. Sans `onFiles` : purement visuelle (démo studio 3D).
 * Avec `onFiles` : sélection réelle de fichiers (envoi géré par l'appelant).
 */
export function ImageDropzone({
  items,
  onAdd,
  onFiles,
  envoiEnCours = false,
  onRemove,
  onMakePrimary,
  max = 8,
  titre = "Glissez vos photos ici",
  aide = "JPG ou PNG, jusqu'à 10 Mo · fond uni, produit centré",
  compact = false,
  className,
}: ImageDropzoneProps) {
  const [survol, setSurvol] = useState(false);
  const fichier = useRef<HTMLInputElement>(null);
  return (
    <div className={cn("space-y-3", className)}>
      {onFiles && (
        <input
          ref={fichier}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => {
            onFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      )}
      <button
        type="button"
        onClick={() => (onFiles ? fichier.current?.click() : onAdd?.())}
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          if (onFiles) onFiles(Array.from(e.dataTransfer.files));
          else onAdd?.();
        }}
        disabled={items.length >= max || envoiEnCours}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-sand/60 px-4 text-center transition-colors hover:border-ring/60 hover:bg-accent/50 disabled:opacity-50",
          compact ? "py-5" : "py-8",
          survol && "border-ring bg-accent",
        )}
      >
        <span className="grid size-11 place-items-center rounded-full bg-card text-accent-foreground shadow-soft">
          {envoiEnCours ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
        </span>
        <span className="text-sm font-semibold">{envoiEnCours ? "Envoi en cours…" : titre}</span>
        <span className="text-[13px] text-muted-foreground">
          {aide} · {items.length}/{max}
        </span>
      </button>
      {items.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it, i) => (
            <li key={it.id} className="group relative aspect-square overflow-hidden rounded-xl border bg-sand">
              {it.apercu}
              {i === 0 && (
                <span className="absolute start-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-night/85 px-2 py-0.5 text-[10px] font-semibold text-cream">
                  <Star className="size-2.5 fill-current" aria-hidden /> Photo principale
                </span>
              )}
              <span className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                <span className="grid size-7 cursor-grab place-items-center rounded-full bg-card/90 text-muted-foreground" aria-hidden>
                  <GripVertical className="size-3.5" />
                </span>
                <span className="flex gap-1">
                  {i !== 0 && onMakePrimary && (
                    <button type="button" onClick={() => onMakePrimary(it.id)} className="grid size-7 place-items-center rounded-full bg-card/90" aria-label={`Définir « ${it.label} » comme photo principale`}>
                      <Star className="size-3.5" />
                    </button>
                  )}
                  {onRemove && (
                    <button type="button" onClick={() => onRemove(it.id)} className="grid size-7 place-items-center rounded-full bg-card/90 text-danger" aria-label={`Retirer « ${it.label} »`}>
                      <X className="size-3.5" />
                    </button>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
