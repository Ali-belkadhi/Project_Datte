// MODULE C — Commandes (Karim Ouertatani) — FactureService (EF-37).
import "server-only";
import { GOUVERNORAT_LABEL, METHODE_PAIEMENT } from "@/lib/constants";
import { formatPoids } from "@/lib/format";
import { genererFacture } from "@/server/integrations/pdf/facture";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { db, prochainNumero } from "../repositories/mongo";

/** Crée l'enregistrement Facture (numéro FAC-AAAA-NNNNNN) une seule fois par commande. */
export async function creerFacture(commandeNumero: string) {
  const col = await db.factures();
  const existante = await col.findOne({ commandeNumero });
  if (existante) return existante;
  const numero = `FAC-${new Date().getFullYear()}-${String(await prochainNumero("facture", 0)).padStart(6, "0")}`;
  const doc = { numero, commandeNumero, emiseLe: new Date() };
  await col.updateOne({ commandeNumero }, { $setOnInsert: doc }, { upsert: true });
  return (await col.findOne({ commandeNumero }))!;
}

/**
 * PDF de la facture d'une commande payée. Accès : le client propriétaire, un vendeur concerné ou un admin.
 * Renvoie null si la commande n'existe pas, n'est pas accessible ou n'est pas encore payée.
 */
export async function facturePdf(commandeNumero: string) {
  const u = await getUtilisateurCourant();
  const c = await (await db.commandes()).findOne({ numero: commandeNumero });
  if (!c) return null;
  const sous = await (await db.sousCommandes()).find({ commandeNumero }).toArray();
  const autorise = u.role === "ADMIN" || c.clientId === u.id || (u.role === "FOURNISSEUR" && sous.some((s) => s.fournisseurId === u.fournisseurId));
  if (!autorise) return null;
  const paye = ["PAYEE", "PARTIELLEMENT_LIVREE", "LIVREE"].includes(c.statut) || (await db.paiements().then((p) => p.findOne({ "objet.reference": commandeNumero, statut: { $in: ["REUSSI", "REMBOURSE"] } })));
  if (!paye) return null;

  const facture = await creerFacture(commandeNumero);
  const a = c.adresse;
  const octets = await genererFacture({
    numero: facture.numero,
    commandeNumero,
    emiseLe: facture.emiseLe,
    client: { nom: a.destinataire, adresse: [a.ligne1, a.ligne2, `${a.codePostal} ${a.ville}, ${GOUVERNORAT_LABEL[a.gouvernorat] ?? a.gouvernorat}`, a.telephone].filter(Boolean) as string[] },
    lignes: sous.flatMap((s) =>
      s.lignes.map((l) => ({
        designation: l.nomProduit,
        vendeur: s.fournisseurNom,
        quantite: l.quantiteGrammes ? formatPoids(l.quantiteGrammes) : `${l.quantiteUnites} u.`,
        prixUnitaire: l.prixUnitaire,
        total: l.total,
      })),
    ),
    sousTotal: c.sousTotal,
    fraisLivraison: c.fraisLivraison,
    remise: c.remise,
    total: c.total,
    methodePaiement: METHODE_PAIEMENT[c.methodePaiement] ?? c.methodePaiement,
  });
  return { nomFichier: `${facture.numero}.pdf`, octets };
}

/** Numéro de facture d'une commande, s'il existe. */
export async function numeroFacture(commandeNumero: string) {
  return (await (await db.factures()).findOne({ commandeNumero }))?.numero ?? null;
}
