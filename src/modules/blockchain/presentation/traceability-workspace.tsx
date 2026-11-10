"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Blocks, ExternalLink, Link2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import type { Produit } from "@/types/domain";
import type { TypeFournisseur } from "@/types/enums";
import {
  TRACEABILITY_STEP_LABELS,
  type ProductBlockchainLink,
  type PublicBlockchainConfig,
  type TraceabilityLot,
  type TraceabilityLotRecord,
  type TraceabilityStep,
  type TraceabilityStepType,
} from "../domain/traceability";
import { addStepWithWallet, createLotWithWallet, readLotWithWallet } from "../infrastructure/ethers/wallet";
import { linkProductToLot, saveConfirmedLot } from "./actions";
import { TraceabilityTimeline } from "./traceability-timeline";

type Props = {
  supplierId: string;
  shopType: TypeFournisseur;
  config: PublicBlockchainConfig | null;
  lots: TraceabilityLotRecord[];
  links: ProductBlockchainLink[];
  products: Produit[];
};

const nowLocal = () => {
  const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return date.toISOString().slice(0, 16);
};

export function TraceabilityWorkspace({ supplierId, shopType, config, lots, links, products }: Props) {
  const router = useRouter();
  const canCreateLot = shopType === "PRODUCTEUR" || shopType === "COOPERATIVE";
  const canAddStep = shopType === "TRANSFORMATEUR";
  const [busy, setBusy] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [lookup, setLookup] = useState<{ lot: TraceabilityLot; history: TraceabilityStep[] } | null>(null);
  const [lotForm, setLotForm] = useState({ lotId: "", region: "", variety: "", harvestDate: "" });
  const [stepForm, setStepForm] = useState({ stepType: "1", date: nowLocal(), location: "", documentHash: "" });
  const [linkForm, setLinkForm] = useState({ productId: "", lotId: "" });
  const saveLot = useAction(saveConfirmedLot, { onSuccess: () => router.refresh() });
  const saveLink = useAction(linkProductToLot, { onSuccess: () => router.refresh() });

  const requireConfig = () => {
    if (!config) throw new Error("Configurez le RPC, le chain ID et l'adresse de DateTraceability dans .env.local.");
    return config;
  };

  const createLot = async () => {
    setBusy(true);
    try {
      const harvestDate = Math.floor(new Date(lotForm.harvestDate).getTime() / 1000);
      if (!lotForm.lotId || !lotForm.region || !lotForm.variety || !Number.isFinite(harvestDate)) throw new Error("Complétez toutes les informations du lot.");
      const result = await createLotWithWallet(requireConfig(), { ...lotForm, harvestDate }, supplierId);
      const saved = await saveLot.run({ lotId: lotForm.lotId, transactionHash: result.transactionHash, walletSignature: result.walletSignature });
      if (saved.ok) setLotForm({ lotId: "", region: "", variety: "", harvestDate: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Création du lot impossible.");
    } finally {
      setBusy(false);
    }
  };

  const searchLot = async (lotId = lookupId) => {
    setBusy(true);
    try {
      const result = await readLotWithWallet(requireConfig(), lotId.trim());
      setLookup(result);
      if (!result) toast.error("Ce lot n'existe pas sur le contrat configuré.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lecture du lot impossible.");
    } finally {
      setBusy(false);
    }
  };

  const addStep = async () => {
    if (!lookup) return;
    setBusy(true);
    try {
      const date = Math.floor(new Date(stepForm.date).getTime() / 1000);
      if (!stepForm.location || !Number.isFinite(date)) throw new Error("La date et le lieu sont obligatoires.");
      await addStepWithWallet(requireConfig(), {
        lotId: lookup.lot.lotId,
        stepType: Number(stepForm.stepType) as TraceabilityStepType,
        date,
        location: stepForm.location,
        documentHash: stepForm.documentHash,
      });
      toast.success("Étape confirmée sur la Blockchain.");
      setStepForm({ stepType: "1", date: nowLocal(), location: "", documentHash: "" });
      await searchLot(lookup.lot.lotId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ajout de l'étape impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!config && (
        <div role="alert" className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          La traçabilité est prête mais le réseau n&apos;est pas configuré. Renseignez les variables Blockchain dans <code>.env.local</code> avant de signer.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {canCreateLot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="size-4" aria-hidden /> Créer un lot agricole</CardTitle>
              <CardDescription>La transaction est signée par MetaMask puis vérifiée côté serveur avant l&apos;enregistrement MongoDB.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Identifiant unique" id="lot-id"><Input id="lot-id" value={lotForm.lotId} onChange={(e) => setLotForm((x) => ({ ...x, lotId: e.target.value }))} placeholder="LOT-TN-2026-001" /></Field>
              <Field label="Date de récolte" id="harvest-date"><Input id="harvest-date" type="date" value={lotForm.harvestDate} onChange={(e) => setLotForm((x) => ({ ...x, harvestDate: e.target.value }))} /></Field>
              <Field label="Région" id="lot-region"><Input id="lot-region" value={lotForm.region} onChange={(e) => setLotForm((x) => ({ ...x, region: e.target.value }))} placeholder="Tozeur" /></Field>
              <Field label="Variété" id="lot-variety"><Input id="lot-variety" value={lotForm.variety} onChange={(e) => setLotForm((x) => ({ ...x, variety: e.target.value }))} placeholder="Deglet Nour" /></Field>
              <Button type="button" variant="brand" className="sm:col-span-2" disabled={busy || saveLot.pending || !config} onClick={createLot}>
                <Blocks aria-hidden /> Signer et créer le lot
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="size-4" aria-hidden /> Vérifier un lot</CardTitle>
            <CardDescription>Lecture directe du contrat. Le wallet sert ici à sélectionner le réseau ; aucune transaction n&apos;est envoyée.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="LOT-TN-2026-001" aria-label="Identifiant du lot" />
              <Button type="button" variant="outline" disabled={busy || !lookupId.trim() || !config} onClick={() => searchLot()}>Vérifier</Button>
            </div>
            {lookup && (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                <p className="font-semibold">{lookup.lot.lotId} · {lookup.lot.variety}</p>
                <p className="text-muted-foreground">{lookup.lot.region} · récolte du {new Date(lookup.lot.harvestDate * 1000).toLocaleDateString("fr-FR")}</p>
                <p className="mt-1 break-all font-mono text-xs">Producteur : {lookup.lot.producer}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {lookup && (
        <Card>
          <CardHeader><CardTitle>Historique Blockchain</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <TraceabilityTimeline history={lookup.history} />
            {canAddStep && (
              <div className="grid gap-4 rounded-2xl border bg-muted/20 p-4 sm:grid-cols-2">
                <Field label="Étape" id="step-type">
                  <select id="step-type" value={stepForm.stepType} onChange={(e) => setStepForm((x) => ({ ...x, stepType: e.target.value }))} className="h-11 w-full rounded-xl border bg-card px-3 text-sm">
                    {TRACEABILITY_STEP_LABELS.map((label, index) => <option key={label} value={index}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Date et heure" id="step-date"><Input id="step-date" type="datetime-local" value={stepForm.date} onChange={(e) => setStepForm((x) => ({ ...x, date: e.target.value }))} /></Field>
                <Field label="Lieu" id="step-location"><Input id="step-location" value={stepForm.location} onChange={(e) => setStepForm((x) => ({ ...x, location: e.target.value }))} placeholder="Atelier de conditionnement" /></Field>
                <Field label="Hash du justificatif (facultatif)" id="step-hash"><Input id="step-hash" value={stepForm.documentHash} onChange={(e) => setStepForm((x) => ({ ...x, documentHash: e.target.value }))} placeholder="ipfs://... ou 0x..." /></Field>
                <Button type="button" variant="brand" className="sm:col-span-2" disabled={busy || !config} onClick={addStep}>Signer l&apos;étape avec MetaMask</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="size-4" aria-hidden /> Associer un produit à un lot</CardTitle>
          <CardDescription>Le lot est vérifié sur le contrat avant la création du lien MongoDB. Ce lien devient ensuite immuable.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Produit" id="link-product">
            <select id="link-product" value={linkForm.productId} onChange={(e) => setLinkForm((x) => ({ ...x, productId: e.target.value }))} className="h-11 w-full rounded-xl border bg-card px-3 text-sm">
              <option value="">Choisir un produit</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.nom}</option>)}
            </select>
          </Field>
          <Field label="Identifiant du lot" id="link-lot">
            <Input id="link-lot" list="known-lots" value={linkForm.lotId} onChange={(e) => setLinkForm((x) => ({ ...x, lotId: e.target.value }))} placeholder="LOT-TN-2026-001" />
            <datalist id="known-lots">{lots.map((lot) => <option key={lot.id} value={lot.lotId} />)}</datalist>
          </Field>
          <Button type="button" variant="brand" disabled={!linkForm.productId || !linkForm.lotId || saveLink.pending || !config} onClick={() => saveLink.run(linkForm)}>Associer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lots et produits liés</CardTitle><CardDescription>{lots.length} lot(s) enregistré(s), {links.length} produit(s) lié(s).</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {links.length === 0 && <p className="text-sm text-muted-foreground">Aucun produit n&apos;est encore associé à un lot Blockchain.</p>}
          {links.map((link) => {
            const product = products.find((item) => item.id === link.productId);
            return (
              <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div><p className="font-semibold">{product?.nom ?? link.productId}</p><p className="font-mono text-xs text-muted-foreground">{link.lotId}</p></div>
                <Button asChild size="sm" variant="outline"><Link href={`/tracabilite/${link.productId}`}>Page publique <ExternalLink aria-hidden /></Link></Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
