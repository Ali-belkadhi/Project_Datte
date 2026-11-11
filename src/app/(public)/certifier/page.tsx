import { redirect } from "next/navigation";

/**
 * Ancienne URL conservée pour les liens créés par le prototype Blockchain.
 * L'émission reste dans l'espace administrateur protégé et utilise MetaMask.
 */
export default async function CertifierCompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string | string[] }>;
}) {
  const { productId } = await searchParams;
  const selectedProductId = Array.isArray(productId) ? productId[0] : productId;
  redirect(
    selectedProductId
      ? `/admin/certifications?productId=${encodeURIComponent(selectedProductId)}`
      : "/admin/certifications",
  );
}
