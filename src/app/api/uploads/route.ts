// COMMUN — stub : répond 501 Not Implemented.
// TODO(commun) : valider type et taille (Zod), requireRole, puis integrations/stockage/r2.urlSigneeUpload().

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "commun", description: "URL signée R2 pour l'envoi de photos et de documents" },
    { status: 501 },
  );

export const POST = nonImplemente;
