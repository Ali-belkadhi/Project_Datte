import { redirect } from "next/navigation";

export default async function FournisseurProduitDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/fournisseur/produits/${id}/modifier`);
}
