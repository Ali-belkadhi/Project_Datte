"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Alerte } from "@/components/ui/feedback";
import { actionEnvoyerOtp, actionVerifierOtp } from "@/server/actions/otp.actions";
import { ShieldCheck, ShieldAlert, Loader2, Send } from "lucide-react";

export function OtpVerifier({
  telephone,
  telephoneVerifie,
}: {
  telephone?: string;
  telephoneVerifie: boolean;
}) {
  const [verifie, setVerifie] = useState(telephoneVerifie);
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  if (!telephone) {
    return (
      <Alerte type="info">
        Ajoutez d&apos;abord un numéro de téléphone dans vos informations personnelles pour le
        vérifier.
      </Alerte>
    );
  }

  if (verifie) {
    return (
      <Alerte type="succes">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4" /> Numéro {telephone} vérifié.
        </span>
      </Alerte>
    );
  }

  function envoyerCode() {
    setErreur(null);
    setSucces(null);
    demarrer(async () => {
      const reponse = await actionEnvoyerOtp();
      if (!reponse.success) {
        setErreur(reponse.error ?? "Envoi impossible");
        return;
      }
      setCodeEnvoye(true);
      setSucces(reponse.message ?? "Code envoyé.");
    });
  }

  function verifier(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donnees = new FormData(e.currentTarget);
    setErreur(null);
    setSucces(null);
    demarrer(async () => {
      const reponse = await actionVerifierOtp(donnees);
      if (!reponse.success) {
        setErreur(reponse.error ?? "Code incorrect");
        return;
      }
      setVerifie(true);
      setSucces(reponse.message ?? "Numéro vérifié.");
    });
  }

  return (
    <div className="space-y-4">
      <Alerte type="info">
        <span className="flex items-center gap-2">
          <ShieldAlert className="size-4" />
          Le numéro {telephone} n&apos;est pas encore vérifié.
        </span>
      </Alerte>

      {erreur && <Alerte type="erreur">{erreur}</Alerte>}
      {succes && !verifie && <Alerte type="succes">{succes}</Alerte>}

      {!codeEnvoye ? (
        <Button type="button" onClick={envoyerCode} disabled={enCours} className="rounded-full">
          {enCours ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Envoyer un code de vérification
        </Button>
      ) : (
        <form onSubmit={verifier} className="flex flex-wrap items-end gap-3">
          <Field
            label="Code reçu par email"
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            required
            className="w-40"
          />
          <Button type="submit" disabled={enCours} className="rounded-full">
            {enCours ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Vérifier
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={envoyerCode}
            disabled={enCours}
            className="rounded-full"
          >
            Renvoyer
          </Button>
        </form>
      )}
    </div>
  );
}
