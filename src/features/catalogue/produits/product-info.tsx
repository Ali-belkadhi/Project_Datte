import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { CATEGORIE_QUALITE, GOUVERNORAT_LABEL, MATURITE, PRESENTATION, TYPE_DERIVE } from "@/lib/constants";
import { formatContenance, formatPoids } from "@/lib/format";
import { VARIETY_PRESETS } from "@/components/three/presets";
import type { Produit } from "@/types/domain";

/** Tableau des caractéristiques. */
export function ProductInfo({ produit: p }: { produit: Produit }) {
  const lignes: [string, string][] =
    p.typeProduit === "DATTE"
      ? [
          ["Variété", VARIETY_PRESETS[p.variete].nom],
          ["Catégorie", CATEGORIE_QUALITE[p.categorieQualite]],
          ["Présentation", PRESENTATION[p.presentation]],
          ["Maturité", `${MATURITE[p.maturite].label} (${MATURITE[p.maturite].detail})`],
          ["Récolte", String(p.anneeRecolte)],
          ["Origine", GOUVERNORAT_LABEL[p.regionOrigine]],
          ["Poids proposés", p.optionsPoids.map(formatPoids).join(" · ")],
          ["Agriculture", p.bio ? "Biologique certifiée" : "Conventionnelle raisonnée"],
          ["Conservation", "Au frais et au sec, 3 mois ; 12 mois au réfrigérateur"],
        ]
      : [
          ["Type", TYPE_DERIVE[p.typeDerive]],
          ["Contenance", formatContenance(p.contenance, p.uniteContenance)],
          ["Variété", p.variete ? VARIETY_PRESETS[p.variete].nom : "Assemblage"],
          ["Ingrédients", p.ingredients],
          ["Origine", GOUVERNORAT_LABEL[p.regionOrigine]],
          ["Agriculture", p.bio ? "Biologique certifiée" : "Conventionnelle raisonnée"],
          ["Conservation", "À l'abri de la lumière ; au frais après ouverture"],
        ];
  return (
    <Table>
      <TableBody>
        {lignes.map(([k, v]) => (
          <TableRow key={k}>
            <TableCell className="w-2/5 py-3 text-muted-foreground">{k}</TableCell>
            <TableCell className="py-3 font-medium whitespace-normal">{v}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
