"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ÉCHANGER AVEC NOUS"
        title="Contact & Showroom"
        description="Une question sur nos coffrets, une commande spéciale ou un partenariat ? Notre équipe de Kébili vous répond avec plaisir."
        crumbs={[{ label: "Contact" }]}
      />

      <div className="container-lux mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-8 rounded-3xl bg-cream-50/80 border border-forest/10 p-8">
            <div>
              <h2 className="font-serif text-2xl font-medium text-forest">
                Maison DEGLA
              </h2>
              <p className="mt-2 text-sm text-muted">
                Venez découvrir nos coffrets et déguster nos créations dans notre boutique atelier à Kébili.
              </p>
            </div>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-sand/60 text-forest shrink-0">
                  <MapPin className="size-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-medium text-forest">Adresse</h3>
                  <p className="text-muted mt-0.5">Route de Douz, Kébili 4200, Tunisie</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-sand/60 text-forest shrink-0">
                  <Phone className="size-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-medium text-forest">Téléphone</h3>
                  <p className="text-muted mt-0.5">+216 75 000 000 / +216 98 000 000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-sand/60 text-forest shrink-0">
                  <Mail className="size-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-medium text-forest">E-mail</h3>
                  <p className="text-muted mt-0.5">contact@degla.tn</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-sand/60 text-forest shrink-0">
                  <Clock className="size-5 text-gold-dark" />
                </div>
                <div>
                  <h3 className="font-medium text-forest">Horaires d&apos;ouverture</h3>
                  <p className="text-muted mt-0.5">Du Lundi au Samedi : 08h30 – 19h00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-cream-50/80 border border-forest/10 p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-forest text-cream">
                  <CheckCircle2 className="size-8 text-gold-light" />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-medium text-forest">Message envoyé !</h3>
                <p className="mt-2 text-sm text-muted max-w-md">
                  Merci de nous avoir contactés. Notre équipe vous répondra dans un délai de 24 heures ouvrées.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-6 rounded-full"
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-serif text-2xl font-medium text-forest">
                  Envoyez-nous un message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Votre Nom complet" id="name" required placeholder="Mohamed Trabelsi" />
                  <Field label="Votre E-mail" id="contact-email" type="email" required placeholder="mohamed@example.com" />
                </div>

                <Field label="Numéro de téléphone" id="contact-phone" type="tel" placeholder="+216 00 000 000" />
                <Field label="Objet du message" id="subject" required placeholder="Question sur un coffret, commande professionnelle..." />

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-xs font-semibold tracking-wide text-ink/80">
                    Votre message
                  </label>
                  <Textarea
                    id="message"
                    required
                    placeholder="Écrivez votre message ici..."
                    rows={5}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full bg-forest text-cream hover:bg-forest-700 py-6 px-8 text-base font-semibold shadow-md flex items-center gap-2"
                >
                  <Send className="size-4" /> Envoyer le message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
