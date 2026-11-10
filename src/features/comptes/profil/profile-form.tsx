"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { profilSchema, type ProfilInput } from "@/lib/validation/comptes";
import { useAction } from "@/hooks/use-action";
import type { Utilisateur } from "@/types/domain";
import { changerMotDePasseAction, majProfil } from "@/server/modules/comptes/actions";

/** Profil : avatar, informations, changement de mot de passe, langue, thème. */
export function ProfileForm({
  utilisateur: u,
  avatarUrl,
  motDePasseModifieLe,
}: {
  utilisateur: Utilisateur;
  avatarUrl?: string | null;
  motDePasseModifieLe?: string | null;
}) {
  const router = useRouter();
  const { run, pending } = useAction(majProfil, { onSuccess: () => router.refresh() });
  const form = useForm<ProfilInput>({
    resolver: zodResolver(profilSchema),
    defaultValues: { prenom: u.prenom, nom: u.nom, email: u.email, telephone: u.telephone ?? "", langue: "FR" },
  });
  const e = form.formState.errors;
  const inputAvatar = useRef<HTMLInputElement>(null);
  const [envoiAvatar, setEnvoiAvatar] = useState(false);
  const [ouvertMdp, setOuvertMdp] = useState(false);

  const envoyerAvatar = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("purpose", "avatar");
    setEnvoiAvatar(true);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (res.ok) router.refresh();
    } finally {
      setEnvoiAvatar(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit((v) => run(v))} className="space-y-6" noValidate>
      <section className="space-y-5 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-brand-fill font-display text-2xl font-semibold text-brand-foreground">{u.initiales}</span>
          )}
          <div className="space-y-1">
            <p className="font-semibold">Photo de profil</p>
            <input
              ref={inputAvatar}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(ev) => {
                const file = ev.target.files?.[0];
                if (file) void envoyerAvatar(file);
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={envoiAvatar} onClick={() => inputAvatar.current?.click()}>
              {envoiAvatar ? "Envoi…" : "Changer la photo"}
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
            <Input id="p-email" type="email" autoComplete="email" {...form.register("email")} readOnly aria-invalid={!!e.email} className="bg-muted" />
            <p className="text-[12px] text-muted-foreground">L&apos;e-mail de connexion ne peut pas être modifié ici.</p>
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
        <div className="flex items-center gap-3 rounded-xl bg-sand p-3">
          <KeyRound className="size-5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold">Mot de passe</p>
            <p className="text-[13px] text-muted-foreground">
              {motDePasseModifieLe ? `Modifié le ${new Date(motDePasseModifieLe).toLocaleDateString("fr-FR")}` : "Aucune modification depuis la création du compte"}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setOuvertMdp(true)}>
            Modifier
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-sand p-3 opacity-70">
          <Smartphone className="size-5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold">Validation en deux étapes</p>
            <p className="text-[13px] text-muted-foreground">Bientôt disponible</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled>
            Activer
          </Button>
        </div>
      </section>
      <div className="flex justify-end">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
      <ChangerMotDePasseDialog ouvert={ouvertMdp} onOpenChange={setOuvertMdp} />
    </form>
  );
}

/** Boîte de dialogue de changement de mot de passe. */
function ChangerMotDePasseDialog({ ouvert, onOpenChange }: { ouvert: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const { run, pending } = useAction(changerMotDePasseAction, {
    onSuccess: async () => {
      setActuel("");
      setNouveau("");
      setConfirmation("");
      setErreur(null);
      onOpenChange(false);
      // Le changement invalide toutes les sessions (tokenVersion) : on reconnecte proprement.
      await signOut({ redirect: false });
      router.replace("/connexion?mdp=modifie");
    },
  });
  const valider = () => {
    if (nouveau.length < 8) return setErreur("8 caractères minimum.");
    if (nouveau !== confirmation) return setErreur("Les mots de passe ne correspondent pas.");
    setErreur(null);
    void run({ motDePasseActuel: actuel, nouveauMotDePasse: nouveau, confirmation });
  };
  return (
    <Dialog open={ouvert} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le mot de passe</DialogTitle>
          <DialogDescription>Vos autres sessions seront déconnectées après le changement.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="mdp-actuel">Mot de passe actuel</Label>
            <Input id="mdp-actuel" type="password" autoComplete="current-password" value={actuel} onChange={(e) => setActuel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mdp-nouveau">Nouveau mot de passe</Label>
            <Input id="mdp-nouveau" type="password" autoComplete="new-password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mdp-confirmation">Confirmer</Label>
            <Input id="mdp-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
          </div>
          {erreur && <p className="text-[13px] text-danger">{erreur}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="brand" disabled={pending} onClick={valider}>
            {pending ? "Modification…" : "Modifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
