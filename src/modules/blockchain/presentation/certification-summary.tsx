import Link from "next/link";
import { BadgeCheck, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CERTIFICATE_STATUS_LABELS, type PublicCertification } from "../domain/certification";

export function CertificationSummary({ productId, certification }: { productId: string; certification: PublicCertification }) {
  const certificate = certification.certificates.find((item) => item.status === 1) ?? certification.certificates[0];
  const status = certificate?.status ?? 0;
  const verified = status === 1;
  return (
    <section className="rounded-2xl border p-5" aria-labelledby="product-certification-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-brand uppercase"><BadgeCheck className="size-4" aria-hidden /> Certification Blockchain</p>
          <h2 id="product-certification-title" className="mt-1 font-display text-xl font-semibold">Certification du produit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {certificate ? `${certificate.certificationType} · ${certificate.certificateId}` : certification.configured ? "Aucun certificat disponible" : "Contrat de certification non configuré"}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${verified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          {verified ? <BadgeCheck className="size-3.5" aria-hidden /> : <ShieldAlert className="size-3.5" aria-hidden />}
          {CERTIFICATE_STATUS_LABELS[status]}
        </span>
      </div>
      <Button asChild variant="outline" className="mt-4"><Link href={`/tracabilite/${productId}`}>Voir les preuves et le QR Code <ExternalLink aria-hidden /></Link></Button>
    </section>
  );
}
