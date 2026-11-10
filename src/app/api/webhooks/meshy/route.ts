import { NextResponse } from "next/server";
import { enregistrerModeleDistant } from "@/server/integrations/meshy/client";
import { creditsRepository, modele3DRepository, produitRepository } from "@/server/modules/catalogue/repositories";

/**
 * Webhook Meshy : fin de génération Image to 3D.
 * Reçoit la notification, stocke le modèle GLB en local, met à jour le modèle 3D et le produit,
 * puis consomme les crédits ou les restitue en cas d'échec.
 */
export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      id?: string;
      status?: "SUCCEEDED" | "FAILED" | "IN_PROGRESS";
      model_urls?: { glb?: string; usdz?: string };
      progress?: number;
    };

    if (!payload.id) {
      return NextResponse.json({ error: "Identifiant de tâche manquant" }, { status: 400 });
    }

    const modele = await modele3DRepository.parTaskId(payload.id);
    if (!modele) {
      // Tâche inconnue ou déjà traitée
      return NextResponse.json({ received: true, note: "Modèle non trouvé pour cette tâche" });
    }

    if (payload.status === "SUCCEEDED" && payload.model_urls?.glb) {
      // 1. Sauvegarder le GLB
      const glbLocalUrl = await enregistrerModeleDistant(payload.model_urls.glb);

      // 2. Mettre à jour le modèle 3D
      await modele3DRepository.maj(modele.id, {
        statut: "PRET",
        progression: 100,
        glbUrl: glbLocalUrl,
        usdzUrl: payload.model_urls.usdz,
      });

      // 3. Associer au produit si existant
      const produit = await produitRepository.parId(modele.produitId);
      if (produit) {
        await produitRepository.maj(produit.id, { modelUrl: glbLocalUrl } as never, produit.fournisseurId);
      }

      // 4. Consommation définitive des crédits
      await creditsRepository.consommer(
        "fournisseur-001",
        modele.creditsConsommes || 1,
        `Génération 3D terminée : « ${modele.produitNom} »`
      );

      return NextResponse.json({ success: true, status: "PRET", glbUrl: glbLocalUrl });
    } else if (payload.status === "FAILED") {
      // Échec : restitution des crédits
      await modele3DRepository.maj(modele.id, {
        statut: "ECHEC",
        progression: 0,
      });

      await creditsRepository.restituer(
        "fournisseur-001",
        modele.creditsConsommes || 1,
        `Échec génération 3D « ${modele.produitNom} » — crédits restitués`
      );

      return NextResponse.json({ success: true, status: "ECHEC", restitue: true });
    }

    return NextResponse.json({ received: true, status: payload.status });
  } catch (err) {
    console.error("Erreur traitement webhook Meshy :", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
