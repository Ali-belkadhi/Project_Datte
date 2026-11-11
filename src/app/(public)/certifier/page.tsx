"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { issueCertificateAction } from "@/modules/blockchain/presentation/actions";

export default function CertifyPage() {
  const sp = useSearchParams();
  const [productId, setProductId] = useState(sp.get("productId") || "");
  const [lotId, setLotId] = useState("LOT-TEST");
  const [org, setOrg] = useState("CertOrg TN");
  const [type, setType] = useState("Bio");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Issuing...");
    try {
      await issueCertificateAction({ productId, lotId, certifierOrg: org, certType: type });
      setMsg("Certificate issued! Visit /tracabilite/" + productId);
    } catch (err) {
      setMsg("Error: " + (err as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-bold">Issue Certificate (Baha)</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Product ID" value={productId} onChange={e=>setProductId(e.target.value)} />
        <input className="w-full border p-2" placeholder="Lot ID" value={lotId} onChange={e=>setLotId(e.target.value)} />
        <input className="w-full border p-2" placeholder="Certifier Org" value={org} onChange={e=>setOrg(e.target.value)} />
        <input className="w-full border p-2" placeholder="Cert Type" value={type} onChange={e=>setType(e.target.value)} />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">Issue</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
