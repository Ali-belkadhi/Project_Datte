// MODULE B — stub : répond 501 Not Implemented.
// TODO(module B) : requireRole(FOURNISSEUR), streamText({ model, output: Output.object({ schema: ficheProduitSchema }) }) — voir server/modules/catalogue/ia/fiche-produit.ts.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "B", description: "IA-B : fiche produit générée à partir des photos (streamText + Output.object)" },
    { status: 501 },
  );

export const POST = nonImplemente;
