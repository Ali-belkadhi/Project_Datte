// MODULE A — e-mails transactionnels (Resend). Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";

export type Email = { a: string; sujet: string; html: string };

/** TODO(module A) : `npm i resend`, RESEND_API_KEY. */
export async function envoyerEmail(_: Email): Promise<{ id: string }> {
  throw new NonImplementeError("email.envoyerEmail");
}
