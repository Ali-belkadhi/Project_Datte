import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (ex-middleware, Next.js 16).
 * Template : laisse TOUT passer — aucune protection de route.
 * Il pose seulement la « zone de démo » (acheteur / vendeur / admin) dans un en-tête,
 * lu par `getSession()` pour choisir l'utilisateur fictif.
 * L'espace fournisseur (/fournisseur, module B) et ses routes API (/api/vendeur) appartiennent à la zone vendeur.
 *
 * TODO(module A) : avec Auth.js, vérifier ici la présence de la session
 * (redirection vers /connexion) — le contrôle fin des rôles reste dans requireRole().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const zone =
    pathname.startsWith("/vendeur") || pathname.startsWith("/fournisseur") || pathname.startsWith("/api/vendeur")
      ? "vendeur"
      : pathname.startsWith("/admin")
        ? "admin"
        : "acheteur";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-degla-zone", zone);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api/(?!vendeur)|_next/static|_next/image|favicon.svg|icons|manifest.webmanifest).*)"],
};
