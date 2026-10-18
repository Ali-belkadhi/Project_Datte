/**
 * Module A - Zod Validation Schemas for Fournisseur
 */

import { z } from 'zod';
import { TypeFournisseur, Gouvernorat, TypeDocument } from '@/domain/enums';

// ===== INSCRIPTION FOURNISSEUR =====
export const onboardingFournisseurSchema = z.object({
  // Étape 1: Informations boutique
  nomBoutique: z.string().min(3, 'Minimum 3 caractères').max(100).trim(),
  type: z.nativeEnum(TypeFournisseur),
  description: z.string().max(1000).trim().optional(),
  region: z.nativeEnum(Gouvernorat),
  adresseExploitation: z.string().min(10, 'Minimum 10 caractères').max(300).trim(),
  
  // Étape 2: Informations légales
  matriculeFiscal: z.string().trim().optional(),
  numeroRNE: z.string().trim().optional(),
  rib: z.string().regex(/^\d{20}$/, 'Le RIB doit contenir 20 chiffres'),
  
  // Étape 3: Documents (handled separately as file uploads)
});

export type OnboardingFournisseurInput = z.infer<typeof onboardingFournisseurSchema>;

// ===== UPDATE BOUTIQUE =====
export const updateBoutiqueSchema = z.object({
  nomBoutique: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  logoUrl: z.string().url().optional(),
  banniereUrl: z.string().url().optional(),
  adresseExploitation: z.string().min(10).max(300).trim().optional(),
});

export type UpdateBoutiqueInput = z.infer<typeof updateBoutiqueSchema>;

// ===== VALIDATION ADMIN =====
export const validerFournisseurSchema = z.object({
  fournisseurId: z.string().min(1),
  valide: z.boolean(),
  motifRefus: z.string().min(10).max(500).trim().optional(),
});

export type ValiderFournisseurInput = z.infer<typeof validerFournisseurSchema>;

// ===== SUSPENSION ADMIN =====
export const suspendreFournisseurSchema = z.object({
  fournisseurId: z.string().min(1),
  motif: z.string().min(5).max(500).trim().optional(),
});

export type SuspendreFournisseurInput = z.infer<typeof suspendreFournisseurSchema>;

// ===== DOCUMENTS FOURNISSEUR =====
export const documentFournisseurSchema = z.object({
  type: z.nativeEnum(TypeDocument),
  fichierUrl: z.string().url('URL de fichier invalide'),
});

export type DocumentFournisseurInput = z.infer<typeof documentFournisseurSchema>;
