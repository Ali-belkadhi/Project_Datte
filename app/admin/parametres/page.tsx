import { ParametresPlateformeService } from "@/server/services/ParametresPlateformeService";
import { ParametresForm, type ParametresVue } from "@/components/admin/parametres-form";

export const metadata = { title: "Administration — Paramètres" };

export default async function AdminParametresPage() {
  const params = await ParametresPlateformeService.get();

  const vue: ParametresVue = {
    tauxCommission: params.tauxCommission,
    fraisLivraisonDefaut: params.fraisLivraisonDefaut,
    livraisonGratuiteDes: params.livraisonGratuiteDes,
    creditsOffertsInscription: params.creditsOffertsInscription,
    coutCreditsImage: params.coutCreditsImage,
    coutCreditsMultiImage: params.coutCreditsMultiImage,
    seuilCreditsBas: params.seuilCreditsBas,
    delaiMax3DMinutes: params.delaiMax3DMinutes,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-forest/10 bg-cream-50/90 p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-medium text-forest">
          Paramètres de la plateforme
        </h2>
        <p className="mt-1 text-sm text-muted">
          Configuration globale appliquée à l&apos;ensemble de la marketplace.
        </p>
        <div className="mt-6">
          <ParametresForm parametres={vue} />
        </div>
      </div>
    </div>
  );
}
