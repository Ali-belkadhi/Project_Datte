export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not defined");
  if (!model) throw new Error("OPENROUTER_MODEL is not defined");
  return {
    apiKey,
    model,
    baseUrl: OPENROUTER_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "DEGLA",
    },
  };
}