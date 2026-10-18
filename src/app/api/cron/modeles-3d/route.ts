// MODULE B — stub : répond 501 Not Implemented.
// TODO(module B) : vérifier CRON_SECRET, relire les tâches EN_COURS > delaiMax3DMinutes via meshy.lireTache, restituer les crédits si échec.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "B", description: "Relance des tâches 3D bloquées (cron)" },
    { status: 501 },
  );

export const GET = nonImplemente;
