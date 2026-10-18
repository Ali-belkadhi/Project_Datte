// MODULE C — stub : répond 501 Not Implemented.
// TODO(module C) : vérifier la signature, Paiement → REUSSI/ECHOUE, Commande → PAYEE, notifier les vendeurs, ou libererStock en cas d'échec.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "C", description: "Confirmation de paiement Konnect / Flouci" },
    { status: 501 },
  );

export const POST = nonImplemente;
