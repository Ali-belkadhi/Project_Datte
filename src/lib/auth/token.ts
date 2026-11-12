import { getToken } from "next-auth/jwt";

/**
 * Lit le jeton de session Auth.js depuis la requête.
 * En HTTPS (production, Vercel), Auth.js nomme le cookie `__Secure-authjs.session-token` ;
 * en HTTP local, `authjs.session-token`. `getToken` ne cherche la version sécurisée que si
 * `secureCookie` est vrai : sans cette option, l'utilisateur paraît déconnecté une fois en ligne.
 */
export function lireJetonSession(req: Request) {
  const url = new URL(req.url);
  const https = url.protocol === "https:" || req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https";
  return getToken({
    req,
    secret: process.env.AUTH_SECRET ?? "dev-only-secret-please-set-AUTH_SECRET",
    secureCookie: https,
  });
}
