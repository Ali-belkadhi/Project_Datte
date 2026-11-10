"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GOUVERNORAT_LABEL } from "@/lib/constants";
import { adresseSchema, type AdresseInput } from "@/lib/validation/comptes";
import { useAction } from "@/hooks/use-action";
import { GOUVERNORATS } from "@/types/enums";
import type { Adresse } from "@/types/domain";
import { ajouterAdresse } from "@/server/modules/comptes/actions";

function Champ({ id, label, erreur, children }: { id: string; label: string; erreur?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {erreur && <p className="text-[13px] text-danger">{erreur}</p>}
    </div>
  );
}

/** Formulaire d'adresse dans une Sheet (ajout / modification). Gouvernorat : 24 options. */
export function AddressFormSheet({ adresse, trigger }: { adresse?: Adresse; trigger?: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const { run, pending } = useAction(ajouterAdresse, { onSuccess: () => setOuvert(false) });
  const form = useForm<AdresseInput>({
    resolver: zodResolver(adresseSchema),
    defaultValues: adresse
      ? { ...adresse, ligne2: adresse.ligne2 ?? "" }
      : { libelle: "", destinataire: "Sarra Mejri", ligne1: "", ligne2: "", ville: "", gouvernorat: "TUNIS", codePostal: "", telephone: "+216 22 345 678", parDefaut: false },
  });
  const e = form.formState.errors;

  return (
    <Sheet open={ouvert} onOpenChange={setOuvert}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Plus aria-hidden /> Nouvelle adresse
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{adresse ? "Modifier l'adresse" : "Nouvelle adresse"}</SheetTitle>
          <SheetDescription>Livraison partout en Tunisie, dans les 24 gouvernorats.</SheetDescription>
        </SheetHeader>
        <form id="form-adresse" className="space-y-4 px-4" onSubmit={form.handleSubmit((v) => run(v))} noValidate>
          <Champ id="a-libelle" label="Nom de l'adresse" erreur={e.libelle?.message}>
            <Input id="a-libelle" placeholder="Maison, Bureau…" {...form.register("libelle")} />
          </Champ>
          <Champ id="a-dest" label="Destinataire" erreur={e.destinataire?.message}>
            <Input id="a-dest" autoComplete="name" {...form.register("destinataire")} />
          </Champ>
          <Champ id="a-l1" label="Adresse" erreur={e.ligne1?.message}>
            <Input id="a-l1" autoComplete="address-line1" placeholder="Numéro et rue" {...form.register("ligne1")} />
          </Champ>
          <Champ id="a-l2" label="Complément (facultatif)">
            <Input id="a-l2" autoComplete="address-line2" placeholder="Résidence, étage…" {...form.register("ligne2")} />
          </Champ>
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <Champ id="a-ville" label="Ville" erreur={e.ville?.message}>
              <Input id="a-ville" autoComplete="address-level2" {...form.register("ville")} />
            </Champ>
            <Champ id="a-cp" label="Code postal" erreur={e.codePostal?.message}>
              <Input id="a-cp" inputMode="numeric" autoComplete="postal-code" {...form.register("codePostal")} />
            </Champ>
          </div>
          <Champ id="a-gouv" label="Gouvernorat" erreur={e.gouvernorat?.message}>
            <Controller
              control={form.control}
              name="gouvernorat"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="a-gouv" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOUVERNORATS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {GOUVERNORAT_LABEL[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Champ>
          <Champ id="a-tel" label="Téléphone" erreur={e.telephone?.message}>
            <Input id="a-tel" type="tel" autoComplete="tel" {...form.register("telephone")} />
          </Champ>
          <Controller
            control={form.control}
            name="parDefaut"
            render={({ field }) => (
              <div className="flex min-h-11 items-center gap-2.5">
                <Checkbox id="a-def" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                <Label htmlFor="a-def">Utiliser comme adresse par défaut</Label>
              </div>
            )}
          />
        </form>
        <SheetFooter>
          <Button type="submit" form="form-adresse" variant="brand" size="lg" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer l'adresse"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
