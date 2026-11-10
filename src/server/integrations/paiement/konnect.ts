// MODULE C — Konnect (Tunisie). Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";
import type { PasserellePaiement } from "./index";

export const konnect: PasserellePaiement = {
  nom: "KONNECT",
  async creerPaiement() {
    throw new NonImplementeError("konnect.creerPaiement");
  },
  async verifierPaiement() {
    throw new NonImplementeError("konnect.verifierPaiement");
  },
};
