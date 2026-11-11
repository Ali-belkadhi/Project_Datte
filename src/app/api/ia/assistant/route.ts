// MODULE C — stub : répond 501 Not Implemented.
// TODO(module C) : streamText({ model, system: PROMPT_SYSTEME_ASSISTANT, tools: OUTILS_ASSISTANT }) — voir server/modules/commandes/ia/assistant-tools.ts.

const nonImplemente = () =>
  Response.json(
    { error: "NOT_IMPLEMENTED", module: "C", description: "IA-C : assistant d'achat (streamText + tools)" },
    { status: 501 },
  );

export const POST = nonImplemente;
