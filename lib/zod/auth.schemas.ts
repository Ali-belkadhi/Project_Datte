/**
 * Module A - Zod Validation Schemas for Authentication
 * Shared between client and server
 */

import { z } from 'zod';
import { Role, Langue } from '@/domain/enums';

// ===== INSCRIPTION =====
export const inscriptionSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  motDePasse: z.string().min(8, 'Minimum 8 caractères').max(100),
  nom: z.string().min(2, 'Minimum 2 caractères').max(50).trim(),
  prenom: z.string().min(2, 'Minimum 2 caractères').max(50).trim(),
  telephone: z
    .string()
    .regex(/^\+216\d{8}$/, 'Format: +216XXXXXXXX')
    .optional(),
  role: z.enum([Role.CLIENT, Role.FOURNISSEUR]),
  langue: z.nativeEnum(Langue).default(Langue.FR),
});

export type InscriptionInput = z.infer<typeof inscriptionSchema>;

// ===== CONNEXION =====
export const connexionSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

export type ConnexionInput = z.infer<typeof connexionSchema>;

// ===== MOT DE PASSE OUBLIÉ =====
export const motDePasseOublieSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
});

export type MotDePasseOublieInput = z.infer<typeof motDePasseOublieSchema>;

// ===== RÉINITIALISATION MOT DE PASSE =====
export const reinitMotDePasseSchema = z.object({
  token: z.string().min(1),
  nouveauMotDePasse: z.string().min(8, 'Minimum 8 caractères').max(100),
  confirmationMotDePasse: z.string(),
}).refine((data) => data.nouveauMotDePasse === data.confirmationMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmationMotDePasse'],
});

export type ReinitMotDePasseInput = z.infer<typeof reinitMotDePasseSchema>;

// ===== OTP VERIFICATION =====
export const otpSchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d{6}$/),
});

export type OtpInput = z.infer<typeof otpSchema>;

// ===== UPDATE PROFIL =====
export const updateProfilSchema = z.object({
  nom: z.string().min(2).max(50).trim().optional(),
  prenom: z.string().min(2).max(50).trim().optional(),
  telephone: z
    .string()
    .regex(/^\+216\d{8}$/, 'Format: +216XXXXXXXX')
    .optional(),
  avatarUrl: z.string().url().optional(),
  langue: z.nativeEnum(Langue).optional(),
});

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>;
