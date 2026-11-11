"use client";

import { useState } from "react";
import { autoSetupProduct } from "@/modules/blockchain/presentation/actions";

export function AutoSetupButton({ productId }: { productId: string }) {
  const [msg, setMsg] = useState("");
  async function run() {
    setMsg("Setting up...");
    try {
      await autoSetupProduct(productId);
      setMsg("Done! Refreshing...");
      window.location.reload();
    } catch (e) {
      setMsg("Error: " + (e as Error).message);
    }
  }
  return (
    <div className="mt-3">
      <button onClick={run} className="rounded bg-black px-3 py-1 text-sm text-white">Auto-setup blockchain (dev)</button>
      {msg && <p className="mt-2 text-xs">{msg}</p>}
    </div>
  );
}
