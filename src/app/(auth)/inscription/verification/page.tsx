import { OtpInput } from "@/features/comptes/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Vérification de l'e-mail");

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ email?: string; role?: string }> }) {
  const { email, role } = await searchParams;
  return <OtpInput email={email ?? ""} suite={role === "FOURNISSEUR" ? "/vendeur/onboarding" : "/compte"} />;
}