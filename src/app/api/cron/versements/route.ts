// MODULE C — stub : répond 501 Not Implemented.
// TODO(module C) : vérifier CRON_SECRET, agréger les sous-commandes LIVREE de la période, calculer commission et net, créer Versement.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "C", description: "Calcul des versements vendeurs (cron bimensuel)" },
    { status: 501 },
  );

export const GET = nonImplemente;
