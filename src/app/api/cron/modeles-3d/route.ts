import { NextResponse } from "next/server";
import { enregistrerModeleDistant, lireTache } from "@/server/integrations/meshy/client";
import { creditsRepository, modele3DRepository, produitRepository } from "@/server/modules/catalogue/repositories";

/**
 * Cron : vérification des modèles 3D en cours de génération.
 * Permet de synchroniser les tâches longues sans dépendre uniquement du webhook.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const modeles = await modele3DRepository.parFournisseur("fournisseur-001");
    const enCours = modeles.filter((m) => m.statut === "EN_COURS" && (m as { taskId?: string }).taskId);

    const resultats: { id: string; statut: string; glbUrl?: string }[] = [];

    for (const m of enCours) {
      const taskId = (m as { taskId?: string }).taskId;
      if (!taskId) continue;

      const info = await lireTache(taskId);

      if (info.statut === "SUCCEEDED" && info.glbUrl) {
        const glbLocal = await enregistrerModeleDistant(info.glbUrl);
        await modele3DRepository.maj(m.id, {
          statut: "PRET",
          progression: 100,
          glbUrl: glbLocal,
        });

        const p = await produitRepository.parId(m.produitId);
        if (p) {
          await produitRepository.maj(p.id, { modelUrl: glbLocal } as never, p.fournisseurId);
        }

        await creditsRepository.consommer(
          "fournisseur-001",
          m.creditsConsommes || 1,
          `Génération 3D terminée (cron) : « ${m.produitNom} »`
        );

        resultats.push({ id: m.id, statut: "PRET", glbUrl: glbLocal });
      } else if (info.statut === "FAILED") {
        await modele3DRepository.maj(m.id, { statut: "ECHEC", progression: 0 });
        await creditsRepository.restituer(
          "fournisseur-001",
          m.creditsConsommes || 1,
          `Échec génération 3D (cron) : « ${m.produitNom} » — crédits restitués`
        );
        resultats.push({ id: m.id, statut: "ECHEC" });
      } else {
        await modele3DRepository.maj(m.id, { progression: info.progression });
        resultats.push({ id: m.id, statut: "EN_COURS" });
      }
    }

    return NextResponse.json({
      traites: resultats.length,
      resultats,
      date: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Erreur cron modèles 3D :", err);
    return NextResponse.json({ error: "Erreur traitement cron" }, { status: 500 });
  }
}
