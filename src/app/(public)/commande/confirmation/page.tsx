import { notFound } from "next/navigation";
import { Container } from "@/components/layout/section";
import { OrderConfirmation } from "@/features/commandes/checkout";
import { pageMetadata } from "@/lib/seo";
import { getCommande } from "@/server/modules/commandes/services/commandes";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Commande confirmée");

/** Confirmation de commande (module C) — commande ?numero=… (MongoDB), repli sur la démo. */
export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ numero?: string }> }) {
  const { numero = "DGL-2026-000123" } = await searchParams;
  const [commande, u] = await Promise.all([getCommande(numero), getUtilisateurCourant()]);
  if (!commande) notFound();
  return (
    <Container className="py-12 md:py-20">
      <OrderConfirmation commande={commande} prenom={u.prenom} />
    </Container>
  );
}
