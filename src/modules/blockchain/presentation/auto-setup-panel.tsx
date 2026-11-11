"use client";

import { useState } from "react";
import { autoSetupProduct } from "@/modules/blockchain/presentation/actions";

export function AutoSetupPanel({ products }: { products: { id: string; nom: string }[] }) {
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [msg, setMsg] = useState("");
  async function run() {
    setMsg("Setting up...");
    try {
      await autoSetupProduct(productId);
      setMsg("Done! Visit /tracabilite/" + productId);
    } catch (e) {
      setMsg("Error: " + (e as Error).message);
    }
  }
  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <h3 className="font-semibold">Auto-setup blockchain (dev)</h3>
      <select className="w-full border p-2" value={productId} onChange={e => setProductId(e.target.value)}>
        {products.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
      </select>
      <button onClick={run} className="rounded bg-black px-3 py-1 text-sm text-white">Auto-setup</button>
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );
}
