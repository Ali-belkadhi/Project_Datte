import Link from "next/link";
import { cn } from "@/lib/utils";

export function PalmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 46c.6-6.3.9-12.6.5-19.4M24.4 26.6c-.2-1.7.2-3.1 1.1-4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24.6 22.4C21 16.6 14.6 14.2 6.8 16.2c5.2.3 10 2.6 13.4 6.5M24.6 22.4c1.8-6.6 7.6-10 15.6-9.6-4.8 1.5-9 4.6-11.4 9.2M24.6 22.4c-1.4-6-6.4-10.6-12.6-11.4 4.4 2.2 7.8 6 9.4 10.6M24.6 22.4c4.2-4.6 10.6-5.4 17-2.4-5-.4-9.8 1.2-13.2 4.6M24.6 22.4c-4.6-2.8-11-2.4-16.4 1.6 4.6-1.2 9.4-.6 13.2 1.8M24.6 22.4c.2-5.6 3-10.6 8-13.6-3 3.4-4.8 7.8-5 12.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.6" cy="25" r="1.1" fill="currentColor" />
      <circle cx="26.2" cy="25.4" r="1.1" fill="currentColor" />
      <circle cx="24.4" cy="27" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="DEGLA — retour à l'accueil"
      className={cn("group inline-flex flex-col items-center leading-none", className)}
    >
      <span className="relative flex items-end">
        <span
          className={cn(
            "font-serif text-[1.9rem] font-semibold tracking-[0.06em] transition-colors",
            light ? "text-cream" : "text-forest",
          )}
        >
          DEGLA
        </span>
        <PalmIcon
          className={cn(
            "absolute -top-3.5 left-[62%] size-5 -translate-x-1/2 transition-transform duration-500 group-hover:-rotate-6",
            light ? "text-gold-light" : "text-gold",
          )}
        />
      </span>
      <span className={cn("mt-1 text-[0.5rem] font-semibold tracking-[0.32em]", light ? "text-cream/70" : "text-ink/60")}>
        KÉBILI • TUNISIA
      </span>
    </Link>
  );
}
