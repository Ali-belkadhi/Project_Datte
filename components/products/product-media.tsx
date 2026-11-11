import Image from "next/image";
import { cn } from "@/lib/utils";

/** Images that are full scenes (cover) rather than cut-out product shots. */
const FULL_BLEED = ["coffret-prestige", "coffret-lid", "hero-desert"];

export function isFullBleed(src: string) {
  return FULL_BLEED.some((k) => src.includes(k));
}

interface ProductMediaProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** Force a rendering mode; defaults to auto-detection */
  mode?: "cover" | "studio";
}

/**
 * Renders a product visual inside a branded frame.
 * Cut-out product shots get a forest-green "studio" backdrop with feathered edges,
 * full scenes are displayed edge-to-edge.
 */
export function ProductMedia({ src, alt, sizes, priority, className, imgClassName, mode }: ProductMediaProps) {
  const resolved = mode ?? (isFullBleed(src) ? "cover" : "studio");
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        resolved === "studio" &&
          "bg-[radial-gradient(ellipse_at_50%_40%,#22573f_0%,#163a29_55%,#0d2a1d_100%)]",
        className,
      )}
    >
      {resolved === "studio" && (
        <>
          <div className="pointer-events-none absolute inset-x-[15%] bottom-[8%] h-[12%] rounded-[50%] bg-black/35 blur-xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgb(212_174_103/0.22),transparent_45%)]" />
        </>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        className={cn(
          resolved === "cover" ? "object-cover" : "feather object-contain p-[9%]",
          "transition-transform duration-700 ease-out",
          imgClassName,
        )}
      />
    </div>
  );
}
