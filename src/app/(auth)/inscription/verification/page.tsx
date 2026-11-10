import { OtpInput } from "@/features/comptes/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Vérification du téléphone");

/** Vérification OTP (module A). */
export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <OtpInput telephone="+216 22 ••• 678" suite={role === "FOURNISSEUR" ? "/vendeur/onboarding" : "/compte"} />;
}
