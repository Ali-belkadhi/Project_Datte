"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProduitAvecVendeur } from "@/types/domain";
import { formatPoids } from "@/lib/format";
import { ligneDepuisProduit } from "@/lib/panier";
import { useCartStore } from "@/stores/cart-store";
import { ajouterAuPanier } from "@/server/modules/commandes/actions";

/**
 * Ajout au panier : mise à jour immédiate de l'affichage (store), puis enregistrement par la
 * Server Action `ajouterAuPanier` (Zod, stock, panier client ou invité). Le panier serveur reste
 * la source de vérité : le toast n'apparaît qu'une fois l'ajout enregistré, et l'affichage est
 * rétabli si le serveur refuse (stock insuffisant, produit retiré…).
 * Renvoie `true` si l'ajout est enregistré.
 */
export function useAddToCart() {
  const ajouter = useCartStore((s) => s.ajouter);
  const router = useRouter();
  return async (item: ProduitAvecVendeur, quantite: { quantiteGrammes?: number; quantiteUnites?: number } = {}) => {
    const ligne = ligneDepuisProduit(item, quantite);
    const avant = useCartStore.getState().lignes;
    ajouter(ligne);
    const r = await ajouterAuPanier({ produitId: item.produit.id, quantiteGrammes: ligne.quantiteGrammes, quantiteUnites: ligne.quantiteUnites });
    if (!r.ok) {
      useCartStore.setState({ lignes: avant });
      toast.error(r.error.message);
      return false;
    }
    const qte = ligne.quantiteGrammes ? formatPoids(ligne.quantiteGrammes) : `${ligne.quantiteUnites} unité${(ligne.quantiteUnites ?? 1) > 1 ? "s" : ""}`;
    toast.success("Ajouté au panier", {
      description: `${item.produit.nom} · ${qte}`,
      action: { label: "Voir le panier", onClick: () => router.push("/panier") },
    });
    return true;
  };
}
