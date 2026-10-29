import { notFound } from "next/navigation";
import { Container } from "@/components/layout/section";
import { OrderConfirmation } from "@/features/commandes/checkout";
import { pageMetadata } from "@/lib/seo";
import { getCommande } from "@/server/modules/commandes/services/commandes";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Commande confirmée");

/** Confirmation de commande (module C) — commande de démonstration DGL-2026-000123. */
export default async function ConfirmationPage() {
  const [commande, u] = await Promise.all([getCommande("DGL-2026-000123"), getUtilisateurCourant()]);
  if (!commande) notFound();
  return (
    <Container className="py-12 md:py-20">
      <OrderConfirmation commande={commande} prenom={u.prenom} />
    </Container>
  );
}
