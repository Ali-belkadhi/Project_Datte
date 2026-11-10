"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { profilSchema, type ProfilInput } from "@/lib/validation/comptes";
import { useAction } from "@/hooks/use-action";
import type { Utilisateur } from "@/types/domain";
import { majProfil } from "@/server/modules/comptes/actions";

/** Profil : avatar, informations, téléphone vérifié, langue (visuel), thème, sécurité. */
export function ProfileForm({ utilisateur: u }: { utilisateur: Utilisateur }) {
  const { run, pending } = useAction(majProfil);
  const form = useForm<ProfilInput>({
    resolver: zodResolver(profilSchema),
    defaultValues: { prenom: u.prenom, nom: u.nom, email: u.email, telephone: u.telephone ?? "", langue: "FR" },
  });
  const e = form.formState.errors;
  return (
    <form onSubmit={form.handleSubmit((v) => run(v))} className="space-y-6" noValidate>
      <section className="space-y-5 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-brand-fill font-display text-2xl font-semibold text-brand-foreground">{u.initiales}</span>
          <div className="space-y-1">
            <p className="font-semibold">Photo de profil</p>
            <Button type="button" variant="outline" size="sm">
              Changer la photo
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-prenom">Prénom</Label>
            <Input id="p-prenom" autoComplete="given-name" {...form.register("prenom")} aria-invalid={!!e.prenom} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-nom">Nom</Label>
            <Input id="p-nom" autoComplete="family-name" {...form.register("nom")} aria-invalid={!!e.nom} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-email">Adresse e-mail</Label>
            <Input id="p-email" type="email" autoComplete="email" {...form.register("email")} aria-invalid={!!e.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-tel" className="flex items-center gap-2">
              Téléphone
              {u.telephoneVerifie && (
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success">
                  <BadgeCheck className="size-3.5" aria-hidden /> Vérifié
                </span>
              )}
            </Label>
            <Input id="p-tel" type="tel" autoComplete="tel" {...form.register("telephone")} aria-invalid={!!e.telephone} />
            {e.telephone && <p className="text-[13px] text-danger">{e.telephone.message}</p>}
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Préférences</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>Langue de l&apos;interface</Label>
          <Controller
            control={form.control}
            name="langue"
            render={({ field }) => (
              <ToggleGroup type="single" value={field.value} onValueChange={(v) => v && field.onChange(v)} className="rounded-xl border p-1" aria-label="Langue">
                <ToggleGroupItem value="FR" size="sm">Français</ToggleGroupItem>
                <ToggleGroupItem value="AR" size="sm">العربية</ToggleGroupItem>
                <ToggleGroupItem value="EN" size="sm">English</ToggleGroupItem>
              </ToggleGroup>
            )}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium">Thème</span>
          <ThemeToggle showLabels />
        </div>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-4 text-success" aria-hidden /> Sécurité
        </h2>
        {[
          { icon: KeyRound, t: "Mot de passe", d: "Modifié il y a 3 mois", a: "Modifier" },
          { icon: Smartphone, t: "Validation en deux étapes", d: "Code par SMS à chaque nouvelle connexion", a: "Activer" },
        ].map((r) => (
          <div key={r.t} className="flex items-center gap-3 rounded-xl bg-sand p-3">
            <r.icon className="size-5 text-muted-foreground" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-semibold">{r.t}</p>
              <p className="text-[13px] text-muted-foreground">{r.d}</p>
            </div>
            <Button type="button" variant="outline" size="sm">
              {r.a}
            </Button>
          </div>
        ))}
      </section>
      <div className="flex justify-end">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
