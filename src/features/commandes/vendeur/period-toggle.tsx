"use client";
import { usePathname, useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** Période 7 j / 30 j / 12 mois (paramètre d'URL ?periode=). */
export function PeriodToggle({ value }: { value: "7j" | "30j" | "12m" }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && router.replace(`${pathname}?periode=${v}`, { scroll: false })}
      className="rounded-xl border bg-card p-1"
      aria-label="Période"
    >
      <ToggleGroupItem value="7j" size="sm" className="px-3">7 j</ToggleGroupItem>
      <ToggleGroupItem value="30j" size="sm" className="px-3">30 j</ToggleGroupItem>
      <ToggleGroupItem value="12m" size="sm" className="px-3">12 mois</ToggleGroupItem>
    </ToggleGroup>
  );
}
