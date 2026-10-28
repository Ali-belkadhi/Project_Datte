"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * Bouton de déconnexion réutilisable.
 * `tone` — "dark" pour la sidebar admin (fond night), "default" sinon.
 * `showLabel` — affiche ou cache le texte (utile quand la sidebar est repliée).
 */
export function LogoutButton({
  tone = "default",
  showLabel = true,
  className,
}: {
  tone?: "default" | "dark";
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/connexion" })}
      aria-label="Se déconnecter"
      className={
        className ??
        (tone === "dark"
          ? "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground")
      }
    >
      <LogOut className="size-[18px] shrink-0" aria-hidden />
      {showLabel && <span>Se déconnecter</span>}
    </button>
  );
}
