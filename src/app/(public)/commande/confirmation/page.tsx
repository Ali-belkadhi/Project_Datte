import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/section";
import { OrderConfirmation } from "@/features/commandes/checkout";
import { pageMetadata } from "@/lib/seo";
import { getCommande } from "@/server/modules/commandes/services/commandes";
import { synchroniserSessionStripe } from "@/server/modules/commandes/services/paiements";
import { getUtilisateurCourant } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Commande confirmée");

/**
 * Confirmation (module C). Au retour de Stripe (`session_id`), la session est vérifiée côté serveur :
 * la commande passe à PAYEE même si le webhook n'est pas encore arrivé (idempotent).
 */
export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ numero?: string; session_id?: string }> }) {
  const { numero, session_id } = await searchParams;
  if (!numero) redirect("/compte/commandes");
  if (session_id) await synchroniserSessionStripe(session_id).catch((e) => console.error("[stripe] vérification de session", e));
  const [commande, u] = await Promise.all([getCommande(numero), getUtilisateurCourant()]);
  if (!commande) notFound();
  const etat = commande.statut === "ANNULEE" ? "annulee" : commande.statut === "EN_ATTENTE_PAIEMENT" && commande.methodePaiement !== "A_LA_LIVRAISON" ? "attente" : "confirmee";
  return (
    <Container className="py-12 md:py-20">
      <OrderConfirmation commande={commande} prenom={u.prenom} etat={etat} />
    </Container>
  );
}
