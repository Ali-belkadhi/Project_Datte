import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const CLIENT_PATHS = ["/compte", "/panier", "/commande", "/assistant"];
const FOURNISSEUR_PATHS = ["/vendeur", "/fournisseur"];
const ADMIN_PATHS = ["/admin"];

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? "dev-only-secret-please-set-AUTH_SECRET",
  });
  const role = (token as { role?: string } | null)?.role;
  const { pathname } = request.nextUrl;
  const matches = (paths: string[]) => paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const needsClient = matches(CLIENT_PATHS);
  const needsFournisseur = matches(FOURNISSEUR_PATHS);
  const needsAdmin = matches(ADMIN_PATHS);

  if (needsClient || needsFournisseur || needsAdmin) {
    if (!token?.sub) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (needsFournisseur && role !== "FOURNISSEUR") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (needsAdmin && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (needsClient && !["CLIENT", "FOURNISSEUR", "ADMIN"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const zone = pathname.startsWith("/vendeur") ? "vendeur" : pathname.startsWith("/admin") ? "admin" : "acheteur";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-degla-zone", zone);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg|icons|manifest.webmanifest).*)"],
};
