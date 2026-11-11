"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

/** Formulaire newsletter — VISUEL uniquement (aucun envoi). */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  return (
    <form
      className="flex h-12 w-full max-w-sm items-center rounded-full border border-cream/15 bg-cream/5 ps-4 pe-1.5 focus-within:border-brand-light"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Inscription enregistrée (démo)", { description: "Vous recevrez nos récoltes en avant-première." });
        setEmail("");
      }}
    >
      <label htmlFor="newsletter" className="sr-only">
        Adresse e-mail
      </label>
      <input
        id="newsletter"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse e-mail"
        className="min-w-0 flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-cream/50"
      />
      <button type="submit" className="grid size-9 place-items-center rounded-full bg-brand-light text-night" aria-label="S'inscrire">
        <ArrowRight className="size-4 rtl:rotate-180" />
      </button>
    </form>
  );
}
