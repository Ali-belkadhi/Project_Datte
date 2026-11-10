"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAction } from "@/hooks/use-action";
import { majPreferencesNotifications } from "@/server/modules/comptes/actions";

/** Préférences de notification (interrupteurs) — utilisées côté vendeur. */
export function NotificationPrefs() {
  const [p, setP] = useState<Record<string, boolean>>({ commandes: true, avis: true, stock: true, modeles3d: true, newsletter: false });
  const { run, pending } = useAction(majPreferencesNotifications);
  const lignes: [string, string][] = [
    ["commandes", "Nouvelles commandes"],
    ["avis", "Nouveaux avis"],
    ["stock", "Alertes de stock bas"],
    ["modeles3d", "Modèles 3D prêts"],
    ["newsletter", "Conseils et actualités DEGLA"],
  ];
  return (
    <div className="space-y-1">
      {lignes.map(([k, l]) => (
        <div key={k} className="flex min-h-12 items-center justify-between border-b last:border-0">
          <Label htmlFor={`np-${k}`}>{l}</Label>
          <Switch id={`np-${k}`} checked={p[k]} onCheckedChange={(v) => setP((x) => ({ ...x, [k]: v }))} />
        </div>
      ))}
      <Button className="mt-3" size="sm" variant="brand" disabled={pending} onClick={() => run(p)}>
        Enregistrer
      </Button>
    </div>
  );
}

/** Ligne de paramètre numérique (admin). */
export function NumberSetting({ id, label, aide, value, suffix, onChange }: { id: string; label: string; aide?: string; value: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2 border-b py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {aide && <p className="text-[13px] text-muted-foreground">{aide}</p>}
      </div>
      <div className="relative w-40">
        <Input id={id} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="pe-14 tabular-nums" />
        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}
