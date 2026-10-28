// MODULE B — stub : répond 501 Not Implemented.
// TODO(module B) : vérifier la signature, lire la tâche, copier GLB/USDZ vers R2, mettre à jour Modele3D, consommer ou restituer les crédits, notifier le vendeur.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "B", description: "Webhook de fin de génération Meshy" },
    { status: 501 },
  );

export const POST = nonImplemente;
