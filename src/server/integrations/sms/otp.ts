// MODULE A — envoi et vérification des codes OTP par SMS. Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";

export async function envoyerOtp(_telephone: string): Promise<{ expireDans: number }> {
  throw new NonImplementeError("sms.envoyerOtp");
}

export async function verifierOtp(_telephone: string, _code: string): Promise<boolean> {
  throw new NonImplementeError("sms.verifierOtp");
}
