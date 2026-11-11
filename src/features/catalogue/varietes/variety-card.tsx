import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import type { Variete } from "@/types/domain";

/** Grande carte variété : glyphe, nom, nom arabe, origine, résumé. */
export function VarietyCard({ variete: v }: { variete: Variete }) {
  return (
    <Link
      href={`/variete/${v.slug}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-16 place-items-center rounded-2xl bg-sand">
          <VarietyGlyph variete={v.slug} className="size-12" />
        </span>
        <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
      </div>
      <div>
        <p className="w-fit font-display text-sm text-muted-foreground" lang="ar" dir="rtl">
          {v.nomArabe}
        </p>
        <h3 className="font-display text-2xl font-semibold">{v.nom}</h3>
        <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden /> {v.origine} · {v.saison}
        </p>
      </div>
      <p className="text-[15px] text-muted-foreground">{v.resume}</p>
    </Link>
  );
}
