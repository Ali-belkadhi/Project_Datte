import { z } from "zod";
import { GOUVERNORATS } from "@/types/enums";

export const RoleChoice = z.enum(["CLIENT", "FOURNISSEUR"]);

export const RegisterSchema = z.object({
  prenom: z.string().min(1).max(60),
  nom: z.string().min(1).max(60),
  email: z.string().email().toLowerCase(),
  motDePasse: z.string().min(8).max(128),
  role: RoleChoice,
  langue: z.enum(["FR", "AR", "EN"]).default("FR"),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  motDePasse: z.string().min(1),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/),
  motDePasse: z.string().min(8).max(128),
});

export const ProfileUpdateSchema = z.object({
  prenom: z.string().min(1).max(60),
  nom: z.string().min(1).max(60),
  langue: z.enum(["FR", "AR", "EN"]),
});

export const AdresseSchema = z.object({
  libelle: z.string().min(1).max(60),
  destinataire: z.string().max(80).optional(),
  ligne1: z.string().min(1).max(120),
  ligne2: z.string().max(120).optional(),
  ville: z.string().min(1).max(60),
  gouvernorat: z.enum(GOUVERNORATS as unknown as [string, ...string[]]),
  codePostal: z.string().regex(/^\d{4}$/),
  telephone: z.string().min(6).max(20),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const SetDefaultAdresseSchema = z.object({ id: z.string().min(1) });

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;