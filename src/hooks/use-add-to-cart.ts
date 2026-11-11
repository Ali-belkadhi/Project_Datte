"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProduitAvecVendeur } from "@/types/domain";
import { formatPoids } from "@/lib/format";
import { ligneDepuisProduit } from "@/lib/panier";
import { useCartStore } from "@/stores/cart-store";
import { ajouterAuPanier } from "@/server/modules/commandes/actions";

/**
 * Ajout au panier de démo : store en mémoire + Server Action `ajouterAuPanier` (validation Zod, rôle)
 * + toast « Ajouté au panier ». TODO(module C) : le panier serveur devient la source de vérité.
 */
export function useAddToCart() {
  const ajouter = useCartStore((s) => s.ajouter);
  const router = useRouter();
  return (item: ProduitAvecVendeur, quantite: { quantiteGrammes?: number; quantiteUnites?: number } = {}) => {
    const ligne = ligneDepuisProduit(item, quantite);
    ajouter(ligne);
    const qte = ligne.quantiteGrammes ? formatPoids(ligne.quantiteGrammes) : `${ligne.quantiteUnites} unité${(ligne.quantiteUnites ?? 1) > 1 ? "s" : ""}`;
    toast.success("Ajouté au panier", {
      description: `${item.produit.nom} · ${qte}`,
      action: { label: "Voir le panier", onClick: () => router.push("/panier") },
    });
    void ajouterAuPanier({ produitId: item.produit.id, quantiteGrammes: ligne.quantiteGrammes, quantiteUnites: ligne.quantiteUnites });
  };
}
