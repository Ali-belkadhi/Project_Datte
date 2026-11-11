"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Ban, FileCheck2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CERTIFICATE_STATUS_LABELS,
  type PublicCertificationConfig,
  type VerifiedCertificate,
} from "../domain/certification";
import { issueCertificateWithWallet, revokeCertificateWithWallet } from "../infrastructure/ethers/certification-wallet";
import { walletErrorMessage } from "../infrastructure/ethers/wallet-errors";

type Candidate = { productId: string; productName: string; lotId: string };

const nextYear = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

export function CertificationAdminWorkspace({
  config,
  candidates,
  certificates,
  initialProductId,
}: {
  config: PublicCertificationConfig | null;
  candidates: Candidate[];
  certificates: VerifiedCertificate[];
  initialProductId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    candidates.some((item) => item.productId === initialProductId)
      ? initialProductId ?? ""
      : candidates[0]?.productId ?? "",
  );
  const [form, setForm] = useState({
    certificateId: "",
    certifierName: "DEGLA Certification",
    certificationType: "BIO",
    documentHash: "",
    expiresOn: nextYear(),
  });
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const candidate = candidates.find((item) => item.productId === selectedProduct);

  const issue = async () => {
    if (!config) return toast.error("Déployez et configurez ProductCertification avant d'émettre un certificat.");
    if (!candidate) return toast.error("Associez d'abord un produit à un lot Blockchain.");
    const certificateId = form.certificateId.trim();
    const certifierName = form.certifierName.trim();
    const certificationType = form.certificationType.trim();
    const documentHash = form.documentHash.trim();
    const expiresAt = Math.floor(new Date(`${form.expiresOn}T23:59:59`).getTime() / 1000);
    if (!certificateId || !certifierName || !certificationType || !documentHash || !Number.isFinite(expiresAt)) {
      return toast.error("Complétez toutes les informations du certificat.");
    }
    if (expiresAt <= Math.floor(Date.now() / 1000)) return toast.error("La date d'expiration doit être future.");

    setBusy(true);
    try {
      await issueCertificateWithWallet(config, {
        certificateId,
        productId: candidate.productId,
        lotId: candidate.lotId,
        certifierName,
        certificationType,
        documentHash,
        expiresAt,
      });
      toast.success("Certificat confirmé sur la Blockchain.");
      setForm((current) => ({ ...current, certificateId: "", documentHash: "" }));
      router.refresh();
    } catch (error) {
      toast.error(walletErrorMessage(error, "Émission du certificat impossible."));
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (certificateId: string) => {
    if (!config) return;
    const reason = (reasons[certificateId] ?? "").trim();
    if (!reason) return toast.error("Indiquez un motif de révocation.");
    setBusy(true);
    try {
      await revokeCertificateWithWallet(config, certificateId, reason);
      toast.success("Certificat révoqué sur la Blockchain.");
      router.refresh();
    } catch (error) {
      toast.error(walletErrorMessage(error, "Révocation impossible."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!config && (
        <p className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          ProductCertification n&apos;est pas encore configuré. Déployez-le après DateTraceability, puis renseignez son adresse dans <code>.env.local</code>.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCheck2 className="size-5" aria-hidden /> Émettre un certificat</CardTitle>
          <CardDescription>Le produit doit déjà être associé à un lot existant. La transaction est signée par un wallet possédant CERTIFIER_ROLE.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Produit et lot" id="certificate-product">
            <select
              id="certificate-product"
              value={selectedProduct}
              onChange={(event) => setSelectedProduct(event.target.value)}
              className="h-11 w-full rounded-xl border bg-card px-3 text-sm"
            >
              {candidates.length === 0 && <option value="">Aucun produit lié à un lot</option>}
              {candidates.map((item) => <option key={item.productId} value={item.productId}>{item.productName} · {item.lotId}</option>)}
            </select>
          </Field>
          <Field label="Identifiant unique" id="certificate-id">
            <Input id="certificate-id" value={form.certificateId} onChange={(event) => setForm((current) => ({ ...current, certificateId: event.target.value }))} placeholder="CERT-BIO-2026-001" />
          </Field>
          <Field label="Type de certification" id="certificate-type">
            <Input id="certificate-type" value={form.certificationType} onChange={(event) => setForm((current) => ({ ...current, certificationType: event.target.value }))} placeholder="BIO, ISO 22000…" />
          </Field>
          <Field label="Organisme certificateur" id="certificate-organization">
            <Input id="certificate-organization" value={form.certifierName} onChange={(event) => setForm((current) => ({ ...current, certifierName: event.target.value }))} placeholder="Organisme national de certification" />
          </Field>
          <Field label="Date d'expiration" id="certificate-expiration">
            <Input id="certificate-expiration" type="date" value={form.expiresOn} onChange={(event) => setForm((current) => ({ ...current, expiresOn: event.target.value }))} />
          </Field>
          <Field label="Hash ou preuve documentaire" id="certificate-proof" className="md:col-span-2">
            <Input id="certificate-proof" value={form.documentHash} onChange={(event) => setForm((current) => ({ ...current, documentHash: event.target.value }))} placeholder="ipfs://… ou sha256:…" />
          </Field>
          <Button type="button" variant="brand" className="md:col-span-2" disabled={busy || !config || !candidate} onClick={issue}>
            {busy ? <LoaderCircle className="animate-spin" aria-hidden /> : <BadgeCheck aria-hidden />} Signer et émettre
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Certificats Blockchain</CardTitle><CardDescription>{certificates.length} certificat(s) émis sur le contrat configuré.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {certificates.length === 0 && <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Aucun certificat disponible.</p>}
          {certificates.map((certificate) => (
            <article key={certificate.certificateId} className="space-y-3 rounded-2xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{certificate.certificationType} · {certificate.certificateId}</p>
                  <p className="text-sm text-muted-foreground">{certificate.certifierName} · produit {certificate.productId} · lot {certificate.lotId}</p>
                </div>
                <CertificateStatus status={certificate.status} />
              </div>
              <p className="break-all font-mono text-xs text-muted-foreground">Preuve : {certificate.documentHash}</p>
              <p className="text-xs text-muted-foreground">Émis le {new Date(certificate.issuedAt * 1000).toLocaleDateString("fr-FR")} · expire le {new Date(certificate.expiresAt * 1000).toLocaleDateString("fr-FR")}</p>
              {certificate.status !== 3 && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input value={reasons[certificate.certificateId] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [certificate.certificateId]: event.target.value }))} placeholder="Motif de révocation" />
                  <Button type="button" variant="destructive" disabled={busy || !config} onClick={() => revoke(certificate.certificateId)}><Ban aria-hidden /> Révoquer</Button>
                </div>
              )}
              {certificate.revocationReason && <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">Motif : {certificate.revocationReason}</p>}
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, id, className, children }: { label: string; id: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><Label htmlFor={id}>{label}</Label>{children}</div>;
}

function CertificateStatus({ status }: { status: VerifiedCertificate["status"] }) {
  const tone = status === 1 ? "bg-success/10 text-success" : status === 2 ? "bg-warning/10 text-warning" : status === 3 ? "bg-danger-soft text-danger" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{CERTIFICATE_STATUS_LABELS[status]}</span>;
}
