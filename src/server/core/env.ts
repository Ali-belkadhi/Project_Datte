import "server-only";

/**
 * Lecture typée des variables d'environnement.
 * Dans le template, TOUTES sont optionnelles : aucune n'est requise pour démarrer.
 * Quand un module branche un service, il rend sa variable obligatoire ici (avec Zod).
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MOCK_LATENCY: Number(process.env.MOCK_LATENCY ?? 300),

  // Futures variables — non utilisées dans le template
  DATABASE_URL: process.env.DATABASE_URL,
  MONGODB_URI: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/degla",
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  AUTH_SECRET: process.env.AUTH_SECRET,
  HF_TOKEN: process.env.HF_TOKEN,
  TRELLIS_SPACE: process.env.TRELLIS_SPACE ?? "trellis-community/TRELLIS",
  MESHY_API_KEY: process.env.MESHY_API_KEY,
  MESHY_WEBHOOK_SECRET: process.env.MESHY_WEBHOOK_SECRET,
  KONNECT_API_KEY: process.env.KONNECT_API_KEY,
  FLOUCI_APP_TOKEN: process.env.FLOUCI_APP_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMS_API_KEY: process.env.SMS_API_KEY,
  R2_BUCKET: process.env.R2_BUCKET,
  AI_MODEL: process.env.AI_MODEL ?? "anthropic/claude-sonnet-5-5",
  CRON_SECRET: process.env.CRON_SECRET,
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL,
  BLOCKCHAIN_CHAIN_ID: process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID,
  DATE_TRACEABILITY_ADDRESS: process.env.NEXT_PUBLIC_DATE_TRACEABILITY_ADDRESS,
  PRODUCT_CERTIFICATION_ADDRESS: process.env.NEXT_PUBLIC_PRODUCT_CERTIFICATION_ADDRESS,
} as const;
