import { Receipt, ShoppingBasket, Star, Wallet } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatNote, formatNombre, formatPrix } from "@/lib/format";
import type { KpiVentes } from "@/types/domain";

/** 4 StatCard : chiffre d'affaires, commandes, panier moyen, note moyenne. */
export function KpiGrid({ kpi }: { kpi: KpiVentes }) {
  const ca = kpi.serie.map((p) => p.chiffreAffaires);
  const cmd = kpi.serie.map((p) => p.commandes);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Chiffre d'affaires" value={formatPrix(kpi.chiffreAffaires)} variation={kpi.variationCA} serie={ca} icon={<Wallet className="size-4" />} />
      <StatCard label="Commandes" value={formatNombre(kpi.commandes)} variation={kpi.variationCommandes} serie={cmd} icon={<Receipt className="size-4" />} />
      <StatCard label="Panier moyen" value={formatPrix(kpi.panierMoyen)} variation={kpi.variationPanier} icon={<ShoppingBasket className="size-4" />} />
      <StatCard label="Note moyenne" value={`${formatNote(kpi.noteMoyenne)}/5`} variation={kpi.variationNote} icon={<Star className="size-4" />} />
    </div>
  );
}
