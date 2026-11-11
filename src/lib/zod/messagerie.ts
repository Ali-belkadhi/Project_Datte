import { z } from "zod";

export const DemarrerConversationSchema = z.object({
  fournisseurId: z.string().min(1),
  produitId: z.string().optional(),
  sousCommandeId: z.string().optional(),
});

export const EnvoyerMessageSchema = z.object({
  conversationId: z.string().min(1),
  contenu: z.string().trim().min(1).max(2000),
});

export const ListerMessagesSchema = z.object({
  conversationId: z.string().min(1),
  cursor: z.string().optional(),
});