import { SignupForm } from "@/features/comptes/auth";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Inscription");

/** Inscription (module A) — ?role=vendeur pré-sélectionne « Je vends mes produits ». */
export default async function InscriptionPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <SignupForm roleInitial={role === "vendeur" ? "FOURNISSEUR" : "CLIENT"} />;
}
