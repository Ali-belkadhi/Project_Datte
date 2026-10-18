/**
 * Module A - Middleware de protection des pages
 *
 * Ici on ne fait qu'un contrôle « rapide » de la présence du cookie de session
 * (le middleware s'exécute sur le runtime Edge : pas d'accès MongoDB).
 * Le contrôle de rôle réel (RBAC) est fait côté serveur via `requireRole()`
 * dans les layouts / Server Actions.
 */

import { NextResponse, type NextRequest } from 'next/server';

/** Préfixes qui exigent une session */
const ROUTES_PROTEGEES = [
  '/compte',
  '/messages',
  '/notifications',
  '/fournisseur',
  '/admin',
];

/** Pages d'authentification (inaccessible si déjà connecté) */
const ROUTES_AUTH = ['/connexion', '/inscription', '/mot-de-passe-oublie'];

const COOKIES_SESSION = ['authjs.session-token', '__Secure-authjs.session-token'];

function estConnecte(req: NextRequest) {
  return COOKIES_SESSION.some((nom) => Boolean(req.cookies.get(nom)?.value));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const connecte = estConnecte(req);

  if (!connecte && ROUTES_PROTEGEES.some((r) => pathname.startsWith(r))) {
    const url = req.nextUrl.clone();
    url.pathname = '/connexion';
    url.search = '';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (connecte && ROUTES_AUTH.some((r) => pathname.startsWith(r))) {
    const url = req.nextUrl.clone();
    url.pathname = '/compte';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/compte/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/fournisseur/:path*',
    '/admin/:path*',
    '/connexion',
    '/inscription',
    '/mot-de-passe-oublie',
  ],
};
