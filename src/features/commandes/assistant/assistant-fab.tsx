"use client";
import type { DonneesAssistant } from "./use-scripted-assistant";

/**
 * Ancienne pastille « Assistant » (catalogue, fiche produit). Remplacée par AssistantPopup,
 * présente sur toutes les pages acheteur : on ne l'affiche plus pour éviter deux boutons.
 * Signature conservée pour ne pas modifier les pages du module B.
 */
 
export function AssistantFab(_props: { data: DonneesAssistant }) {
  return null;
}
