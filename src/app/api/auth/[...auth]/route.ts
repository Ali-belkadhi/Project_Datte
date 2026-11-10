// MODULE A — stub : répond 501 Not Implemented.
// TODO(module A) : remplacer par `export const { GET, POST } = handlers` d'Auth.js.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "A", description: "Auth.js (connexion, OAuth Google, session)" },
    { status: 501 },
  );

export const GET = nonImplemente;
export const POST = nonImplemente;
