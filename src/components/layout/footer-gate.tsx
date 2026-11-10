"use client";
import { usePathname } from "next/navigation";

/** Masque le pied de page sur les écrans plein écran (assistant). */
export function FooterGate({ children }: { children: React.ReactNode }) {
  return usePathname() === "/assistant" ? null : <>{children}</>;
}
