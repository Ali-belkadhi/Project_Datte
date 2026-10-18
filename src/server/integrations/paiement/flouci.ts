// MODULE C — Flouci (Tunisie). Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";
import type { PasserellePaiement } from "./index";

export const flouci: PasserellePaiement = {
  nom: "FLOUCI",
  async creerPaiement() {
    throw new NonImplementeError("flouci.creerPaiement");
  },
  async verifierPaiement() {
    throw new NonImplementeError("flouci.verifierPaiement");
  },
};
