/**
 * Module A - Zod Validation Schemas for Adresse
 */

import { z } from 'zod';
import { Gouvernorat } from '@/domain/enums';

export const adresseSchema = z.object({
  libelle: z.string().min(2, 'Minimum 2 caractères').max(50).trim(),
  ligne1: z.string().min(5, 'Minimum 5 caractères').max(200).trim(),
  ligne2: z.string().max(200).trim().optional(),
  ville: z.string().min(2, 'Minimum 2 caractères').max(100).trim(),
  gouvernorat: z.nativeEnum(Gouvernorat),
  codePostal: z.string().regex(/^\d{4}$/, 'Code postal doit contenir 4 chiffres'),
  telephone: z.string().regex(/^\+216\d{8}$/, 'Format: +216XXXXXXXX'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type AdresseInput = z.infer<typeof adresseSchema>;

export const updateAdresseSchema = adresseSchema.partial();

export type UpdateAdresseInput = z.infer<typeof updateAdresseSchema>;
