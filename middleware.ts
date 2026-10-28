import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const CLIENT_PATHS = ["/compte", "/panier", "/commande", "/assistant"];
const FOURNISSEUR_PATHS = ["/vendeur"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? "dev-only-secret-please-set-AUTH_SECRET" });
  const role = (token as { role?: string } | null)?.role;
  const isAuthed = !!token?.sub;

  const { pathname } = req.nextUrl;
  const needsClient = CLIENT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const needsFournisseur = FOURNISSEUR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const needsAdmin = ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // ── DEBUG LOGS ──────────────────────────────────────────────────────────────
  if (needsClient || needsFournisseur || needsAdmin) {
    console.log(
      `[middleware] ${req.method} ${pathname} | isAuthed=${isAuthed} | role=${role ?? "none"} | token.sub=${token?.sub ?? "—"}`
    );
  }
  // ───────────────────────────────────────────────────────────────────────────

  if (needsClient || needsFournisseur || needsAdmin) {
    if (!isAuthed) {
      console.log(`[middleware] ⛔ not authed → redirect /connexion?callbackUrl=${pathname}`);
      const url = new URL("/connexion", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (needsFournisseur && role !== "FOURNISSEUR" && role !== "ADMIN") {
      console.log(`[middleware] ⛔ role ${role} not allowed for /vendeur → redirect /`);
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (needsAdmin && role !== "ADMIN") {
      console.log(`[middleware] ⛔ role ${role} not allowed for /admin → redirect /`);
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (needsClient && role !== "CLIENT" && role !== "ADMIN" && role !== "FOURNISSEUR") {
      console.log(`[middleware] ⛔ role ${role} not allowed for /compte → redirect /`);
      return NextResponse.redirect(new URL("/", req.url));
    }
    console.log(`[middleware] ✅ access granted to ${pathname}`);
  }

  const zone = pathname.startsWith("/vendeur") ? "vendeur" : pathname.startsWith("/admin") ? "admin" : "acheteur";
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-degla-zone", zone);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg|icons|manifest.webmanifest).*)"],
};