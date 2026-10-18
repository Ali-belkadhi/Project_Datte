"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionUpdateParametres } from "@/server/actions/parametres.actions";

export interface ParametresVue {
  tauxCommission: number;
  fraisLivraisonDefaut: number;
  livraisonGratuiteDes?: number;
  creditsOffertsInscription: number;
  coutCreditsImage: number;
  coutCreditsMultiImage: number;
  seuilCreditsBas: number;
  delaiMax3DMinutes: number;
}

export function ParametresForm({ parametres }: { parametres: ParametresVue }) {
  const [commissionPct, setCommissionPct] = useState(
    (parametres.tauxCommission * 100).toString()
  );
  const [fraisLivraison, setFraisLivraison] = useState(
    (parametres.fraisLivraisonDefaut / 1000).toString()
  );
  const [livraisonGratuite, setLivraisonGratuite] = useState(
    parametres.livraisonGratuiteDes != null
      ? (parametres.livraisonGratuiteDes / 1000).toString()
      : ""
  );
  const [creditsOfferts, setCreditsOfferts] = useState(
    parametres.creditsOffertsInscription.toString()
  );
  const [coutImage, setCoutImage] = useState(parametres.coutCreditsImage.toString());
  const [coutMulti, setCoutMulti] = useState(parametres.coutCreditsMultiImage.toString());
  const [seuilBas, setSeuilBas] = useState(parametres.seuilCreditsBas.toString());
  const [delai3D, setDelai3D] = useState(parametres.delaiMax3DMinutes.toString());

  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  function enregistrer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData();

    donnees.set("tauxCommission", String(Number(commissionPct) / 100));
    donnees.set("fraisLivraisonDefaut", String(Math.round(Number(fraisLivraison) * 1000)));
    if (livraisonGratuite.trim() !== "") {
      donnees.set("livraisonGratuiteDes", String(Math.round(Number(livraisonGratuite) * 1000)));
    }
    donnees.set("creditsOffertsInscription", creditsOfferts);
    donnees.set("coutCreditsImage", coutImage);
    donnees.set("coutCreditsMultiImage", coutMulti);
    donnees.set("seuilCreditsBas", seuilBas);
    donnees.set("delaiMax3DMinutes", delai3D);

    setRetour(null);
    demarrer(async () => {
      const reponse = await actionUpdateParametres(donnees);
      if (!reponse.success) {
        setRetour({
          ok: false,
          texte:
            (reponse.errors as Record<string, string[] | undefined>)?._form?.[0] ??
            "Erreur lors de la mise à jour.",
        });
        return;
      }
      setRetour({ ok: true, texte: "Paramètres enregistrés." });
    });
  }

  return (
    <form onSubmit={enregistrer} className="space-y-8">
      {retour && <Alerte type={retour.ok ? "succes" : "erreur"}>{retour.texte}</Alerte>}

      <section className="grid gap-5 sm:grid-cols-2">
        <h3 className="col-span-full font-serif text-lg font-medium text-forest">
          Commissions & livraison
        </h3>
        <Field
          label="Taux de commission (%)"
          id="commissionPct"
          type="number"
          step="0.1"
          min={0}
          max={100}
          value={commissionPct}
          onChange={(e) => setCommissionPct(e.target.value)}
        />
        <Field
          label="Frais de livraison par défaut (DT)"
          id="fraisLivraison"
          type="number"
          step="0.1"
          min={0}
          value={fraisLivraison}
          onChange={(e) => setFraisLivraison(e.target.value)}
        />
        <Field
          label="Livraison gratuite à partir de (DT)"
          id="livraisonGratuite"
          type="number"
          step="0.1"
          min={0}
          hint="Laisser vide pour désactiver"
          value={livraisonGratuite}
          onChange={(e) => setLivraisonGratuite(e.target.value)}
        />
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <h3 className="col-span-full font-serif text-lg font-medium text-forest">
          Crédits 3D
        </h3>
        <Field
          label="Crédits offerts à l'inscription"
          id="creditsOfferts"
          type="number"
          min={0}
          value={creditsOfferts}
          onChange={(e) => setCreditsOfferts(e.target.value)}
        />
        <Field
          label="Seuil d'alerte crédits bas"
          id="seuilBas"
          type="number"
          min={0}
          value={seuilBas}
          onChange={(e) => setSeuilBas(e.target.value)}
        />
        <Field
          label="Coût génération (image unique)"
          id="coutImage"
          type="number"
          min={1}
          value={coutImage}
          onChange={(e) => setCoutImage(e.target.value)}
        />
        <Field
          label="Coût génération (multi-images)"
          id="coutMulti"
          type="number"
          min={1}
          value={coutMulti}
          onChange={(e) => setCoutMulti(e.target.value)}
        />
        <Field
          label="Délai maximum de génération (minutes)"
          id="delai3D"
          type="number"
          min={1}
          value={delai3D}
          onChange={(e) => setDelai3D(e.target.value)}
        />
      </section>

      <Button type="submit" disabled={enCours}>
        {enCours ? "Enregistrement…" : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
}
