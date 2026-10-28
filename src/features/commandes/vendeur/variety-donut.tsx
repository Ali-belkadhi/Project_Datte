"use client";
import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { RepartitionVariete } from "@/types/domain";

const COULEURS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

/** Répartition des ventes par variété (donut). */
export function VarietyDonut({ data }: { data: RepartitionVariete[] }) {
  const config = Object.fromEntries(data.map((d, i) => [d.variete, { label: d.nom, color: COULEURS[i % COULEURS.length] }])) satisfies ChartConfig;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ChartContainer config={config} className="aspect-square h-44 shrink-0">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v, n) => `${config[String(n)]?.label ?? n} : ${v} %`} />} />
          <Pie data={data} dataKey="part" nameKey="variete" innerRadius={48} outerRadius={78} strokeWidth={3} stroke="var(--card)">
            {data.map((d, i) => (
              <Cell key={d.variete} fill={COULEURS[i % COULEURS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.variete} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ background: COULEURS[i % COULEURS.length] }} aria-hidden />
            <span className="flex-1">{d.nom}</span>
            <span className="font-semibold tabular-nums">{d.part} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
