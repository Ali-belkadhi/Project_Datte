"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import type { ParametresPlateforme } from "@/types/domain";
import { majParametres } from "@/server/modules/comptes/actions";
import { NumberSetting } from "./settings-panel";

/** Paramètres plateforme : commission, livraison, coûts en crédits 3D, crédits offerts. */
export function PlatformSettings({ parametres }: { parametres: ParametresPlateforme }) {
  const [p, setP] = useState(parametres);
  const { run, pending } = useAction(majParametres);
  const set = (k: keyof ParametresPlateforme) => (v: number) => setP((x) => ({ ...x, [k]: v }));
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card px-5 py-2">
        <h2 className="pt-3 font-semibold">Commission et livraison</h2>
        <NumberSetting id="ps-com" label="Taux de commission" aide="Prélevé sur chaque sous-commande livrée." value={p.tauxCommission} suffix="%" onChange={set("tauxCommission")} />
        <NumberSetting id="ps-liv" label="Frais de livraison par défaut" value={p.fraisLivraisonDefaut / 1000} suffix="DT" onChange={(v) => set("fraisLivraisonDefaut")(Math.round(v * 1000))} />
        <NumberSetting id="ps-grat" label="Livraison offerte dès" value={p.livraisonGratuiteDes / 1000} suffix="DT" onChange={(v) => set("livraisonGratuiteDes")(Math.round(v * 1000))} />
      </section>
      <section className="rounded-2xl border bg-card px-5 py-2">
        <h2 className="pt-3 font-semibold">Crédits 3D</h2>
        <NumberSetting id="ps-c1" label="Coût d'une génération (1 photo)" value={p.coutCreditsImage} suffix="crédit" onChange={set("coutCreditsImage")} />
        <NumberSetting id="ps-c2" label="Coût d'une génération (plusieurs photos)" value={p.coutCreditsMultiImage} suffix="crédits" onChange={set("coutCreditsMultiImage")} />
        <NumberSetting id="ps-off" label="Crédits offerts à l'inscription" value={p.creditsOffertsInscription} suffix="crédits" onChange={set("creditsOffertsInscription")} />
      </section>
      <div className="flex justify-end">
        <Button variant="brand" size="lg" disabled={pending} onClick={() => run(p)}>Enregistrer les paramètres</Button>
      </div>
    </div>
  );
}
