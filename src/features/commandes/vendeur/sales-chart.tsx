"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatPrix } from "@/lib/format";
import type { PointVentes } from "@/types/domain";

const config = { chiffreAffaires: { label: "Chiffre d'affaires", color: "var(--chart-1)" } } satisfies ChartConfig;

const jour = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Tunis" });
const mois = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "Africa/Tunis" });

/** Chiffre d'affaires en aire (couleur ambre). */
export function SalesChart({ serie, mensuel = false, className }: { serie: PointVentes[]; mensuel?: boolean; className?: string }) {
  const data = serie.map((p) => ({ ...p, dt: p.chiffreAffaires / 1000, label: (mensuel ? mois : jour).format(new Date(p.date)) }));
  return (
    <ChartContainer config={config} className={className ?? "aspect-auto h-64 w-full"}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fill-ca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chiffreAffaires)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-chiffreAffaires)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${Math.round(v)}`} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => formatPrix(Number(v) * 1000)} />} />
        <Area dataKey="dt" name="chiffreAffaires" type="monotone" stroke="var(--color-chiffreAffaires)" strokeWidth={2.25} fill="url(#fill-ca)" />
      </AreaChart>
    </ChartContainer>
  );
}
