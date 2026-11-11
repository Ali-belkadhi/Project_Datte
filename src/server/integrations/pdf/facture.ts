// MODULE C — génération des factures PDF (pdf-lib, polices standard : aucun fichier externe).
import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type DonneesFacture = {
  numero: string;
  commandeNumero: string;
  emiseLe: Date;
  client: { nom: string; adresse: string[] };
  lignes: { designation: string; vendeur: string; quantite: string; prixUnitaire: number; total: number }[];
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  total: number;
  methodePaiement: string;
};

const dt = (millimes: number) => `${(millimes / 1000).toFixed(3).replace(".", ",")} DT`;
const BRUN = rgb(0.17, 0.1, 0.07);
const AMBRE = rgb(0.72, 0.44, 0.12);
const GRIS = rgb(0.42, 0.38, 0.35);

/** Facture A4 d'une commande. Montants en millimes. */
export async function genererFacture(f: DonneesFacture): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Facture ${f.numero}`);
  pdf.setAuthor("DEGLA");
  const page = pdf.addPage([595.28, 841.89]);
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const gras = await pdf.embedFont(StandardFonts.HelveticaBold);
  const titre = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const { width } = page.getSize();
  const m = 48;
  let y = 790;

  const texte = (t: string, x: number, yy: number, o: { taille?: number; police?: typeof normal; couleur?: ReturnType<typeof rgb>; droite?: boolean } = {}) => {
    const police = o.police ?? normal;
    const taille = o.taille ?? 10;
    // polices standard = encodage WinAnsi : on remplace les espaces fines / insécables et le signe moins
    t = t.replace(/[   ]/g, " ").replace(/−/g, "-");
    const xx = o.droite ? x - police.widthOfTextAtSize(t, taille) : x;
    page.drawText(t, { x: xx, y: yy, size: taille, font: police, color: o.couleur ?? BRUN });
  };

  texte("DEGLA", m, y, { taille: 30, police: titre });
  texte("Dattes de Tunisie, directement des palmeraies", m, y - 18, { taille: 9, couleur: GRIS });
  texte("FACTURE", width - m, y, { taille: 18, police: gras, droite: true, couleur: AMBRE });
  texte(f.numero, width - m, y - 18, { droite: true });
  texte(`Émise le ${f.emiseLe.toLocaleDateString("fr-FR")}`, width - m, y - 32, { droite: true, couleur: GRIS, taille: 9 });
  texte(`Commande ${f.commandeNumero}`, width - m, y - 45, { droite: true, couleur: GRIS, taille: 9 });

  y -= 90;
  texte("FACTURÉ À", m, y, { taille: 8, police: gras, couleur: AMBRE });
  texte(f.client.nom, m, y - 15, { police: gras });
  f.client.adresse.forEach((l, i) => texte(l, m, y - 29 - i * 13, { couleur: GRIS }));

  y -= 100;
  const cols = [m, m + 230, m + 330, m + 420, width - m];
  page.drawRectangle({ x: m - 6, y: y - 7, width: width - 2 * m + 12, height: 22, color: rgb(0.96, 0.93, 0.87) });
  ["Désignation", "Quantité", "Prix unitaire", "", "Total"].forEach((h, i) => h && texte(h, i === 4 ? cols[4] : cols[i], y, { police: gras, taille: 9, droite: i === 4 }));
  y -= 24;
  for (const l of f.lignes) {
    if (y < 150) break; // une page suffit pour une commande de marketplace
    texte(l.designation.slice(0, 42), cols[0], y);
    texte(l.vendeur.slice(0, 40), cols[0], y - 11, { taille: 8, couleur: GRIS });
    texte(l.quantite, cols[1], y);
    texte(dt(l.prixUnitaire), cols[2], y);
    texte(dt(l.total), cols[4], y, { droite: true });
    y -= 30;
    page.drawLine({ start: { x: m, y: y + 12 }, end: { x: width - m, y: y + 12 }, thickness: 0.5, color: rgb(0.88, 0.84, 0.78) });
  }

  y -= 10;
  const ligneTotal = (lib: string, val: string, fort = false) => {
    texte(lib, cols[3] - 40, y, { police: fort ? gras : normal, taille: fort ? 12 : 10 });
    texte(val, cols[4], y, { police: fort ? gras : normal, taille: fort ? 12 : 10, droite: true });
    y -= fort ? 22 : 16;
  };
  ligneTotal("Sous-total", dt(f.sousTotal));
  ligneTotal("Livraison", f.fraisLivraison ? dt(f.fraisLivraison) : "Offerte");
  if (f.remise) ligneTotal("Remise", `- ${dt(f.remise)}`);
  ligneTotal("Total TTC", dt(f.total), true);
  texte(`Paiement : ${f.methodePaiement}`, m, y + 6, { couleur: GRIS, taille: 9 });

  texte("DEGLA — marketplace de dattes tunisiennes · Merci pour votre commande.", m, 50, { taille: 8, couleur: GRIS });
  return pdf.save();
}
