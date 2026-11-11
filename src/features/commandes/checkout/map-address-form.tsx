"use client";
/**
 * Adresse de livraison choisie sur la carte (option du checkout).
 * 1. La carte s'ouvre sur la position actuelle (géolocalisation du navigateur, avec accord) ;
 *    à défaut, sur Tunis.
 * 2. Le client déplace le marqueur, clique sur la carte ou cherche une adresse.
 * 3. Les champs sont pré-remplis par géocodage inverse (OpenStreetMap / Nominatim via /api/geocodage)
 *    et restent modifiables. Le formulaire est validé avec le même schéma Zod que le serveur.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GOUVERNORAT_LABEL } from "@/lib/constants";
import { adresseLivraisonSchema, type AdresseLivraisonInput } from "@/lib/validation/commandes";
import { GOUVERNORATS, type Gouvernorat } from "@/types/enums";
import type { Position } from "./map-picker";

const MapPicker = dynamic(() => import("./map-picker"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-sand" aria-hidden />,
});

const TUNIS: Position = { latitude: 36.8065, longitude: 10.1815 };

type Geocode = { latitude: number; longitude: number; ligne1: string; ville: string; codePostal: string; gouvernorat: Gouvernorat | null; libelleComplet: string };
type Champs = Omit<AdresseLivraisonInput, "latitude" | "longitude" | "gouvernorat"> & { gouvernorat: Gouvernorat | "" };

export function MapAddressForm({
  initial,
  onChange,
}: {
  /** Valeurs de départ : adresse déjà choisie (retour à l'étape) ou destinataire / téléphone par défaut. */
  initial?: Partial<AdresseLivraisonInput>;
  /** Adresse valide, ou null tant que le formulaire est incomplet. */
  onChange: (adresse: AdresseLivraisonInput | null) => void;
}) {
  const dejaPlace = initial?.latitude !== undefined && initial?.longitude !== undefined;
  const [localisation, setLocalisation] = useState<"attente" | "ok" | "refusee" | "indisponible">(dejaPlace ? "ok" : "attente");
  const [position, setPosition] = useState<Position>(dejaPlace ? { latitude: initial!.latitude!, longitude: initial!.longitude! } : TUNIS);
  
  const [geocodage, setGeocodage] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<Geocode[]>([]);
  const [champs, setChamps] = useState<Champs>({
    destinataire: initial?.destinataire ?? "",
    telephone: initial?.telephone ?? "",
    ligne1: initial?.ligne1 ?? "",
    ligne2: initial?.ligne2 ?? "",
    ville: initial?.ville ?? "",
    codePostal: initial?.codePostal ?? "",
    gouvernorat: initial?.gouvernorat ?? "",
  });
  const [touche, setTouche] = useState<Partial<Record<keyof Champs, boolean>>>({});
  const requete = useRef(0);

  /* ---- géocodage inverse : remplit les champs d'adresse (modifiables ensuite) ---- */
  const remplirDepuis = useCallback(async (p: Position) => {
    const id = ++requete.current;
    setGeocodage(true);
    try {
      const r = await fetch(`/api/geocodage?lat=${p.latitude}&lng=${p.longitude}`);
      const { adresse } = (await r.json()) as { adresse: Geocode | null };
      if (id !== requete.current || !adresse) return;
      setChamps((c) => ({
        ...c,
        ligne1: adresse.ligne1 || c.ligne1,
        ville: adresse.ville || c.ville,
        codePostal: adresse.codePostal || c.codePostal,
        gouvernorat: adresse.gouvernorat ?? c.gouvernorat,
      }));
    } catch {
      /* hors ligne ou service indisponible : le client saisit à la main */
    } finally {
      if (id === requete.current) setGeocodage(false);
    }
  }, []);

  const deplacer = useCallback(
    (p: Position) => {
      setPosition(p);
      void remplirDepuis(p);
    },
    [remplirDepuis],
  );

  /* ---- position actuelle (une fois, avec l'accord du navigateur) ---- */
  // les mises à jour d'état se font dans les rappels (asynchrones) de l'API de géolocalisation
  const demanderPosition = useCallback(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setLocalisation("indisponible"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalisation("ok");
        deplacer({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => setLocalisation(err.code === err.PERMISSION_DENIED ? "refusee" : "indisponible"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [deplacer]);

  const localiser = () => {
    setLocalisation("attente");
    demanderPosition();
  };

  useEffect(() => {
    // première ouverture : centrer sur la position actuelle ; retour à l'étape : garder le point choisi
    if (!dejaPlace) demanderPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- recherche d'adresse ---- */
  const chercher = async () => {
    if (recherche.trim().length < 3) return;
    setGeocodage(true);
    try {
      const r = await fetch(`/api/geocodage?q=${encodeURIComponent(recherche)}`);
      const { resultats: liste } = (await r.json()) as { resultats?: Geocode[] };
      setResultats(liste ?? []);
    } finally {
      setGeocodage(false);
    }
  };

  /* ---- validation : même schéma que le serveur ---- */
  const valeur = { ...champs, ligne2: champs.ligne2 || undefined, latitude: position.latitude, longitude: position.longitude };
  const verif = adresseLivraisonSchema.safeParse(valeur);
  const erreurs = verif.success ? {} : Object.fromEntries(verif.error.issues.map((i) => [i.path[0], i.message]));
  const cle = JSON.stringify(valeur);
  useEffect(() => {
    onChange(verif.success ? verif.data : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  const champ = (k: keyof Champs, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`carte-${k}`}>{label}</Label>
      <Input
        id={`carte-${k}`}
        value={champs[k] ?? ""}
        onChange={(e) => setChamps((c) => ({ ...c, [k]: e.target.value }))}
        onBlur={() => setTouche((t) => ({ ...t, [k]: true }))}
        aria-invalid={touche[k] && !!erreurs[k]}
        {...props}
      />
      {touche[k] && erreurs[k] && <p className="text-[12px] text-danger">{erreurs[k]}</p>}
    </div>
  );

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void chercher();
          }}
        >
          <Input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher une adresse, un quartier…" aria-label="Rechercher une adresse" />
          <Button type="submit" variant="outline" size="icon" aria-label="Rechercher">
            <Search aria-hidden />
          </Button>
        </form>
        <Button type="button" variant="outline" onClick={localiser}>
          <LocateFixed aria-hidden /> Ma position
        </Button>
      </div>

      {resultats.length > 0 && (
        <ul className="divide-y rounded-xl border text-sm">
          {resultats.map((r) => (
            <li key={`${r.latitude},${r.longitude}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-start hover:bg-muted"
                onClick={() => {
                  setResultats([]);
                  deplacer({ latitude: r.latitude, longitude: r.longitude });
                }}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                {r.libelleComplet}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* isolate : les calques Leaflet (z-index élevés) restent sous la barre d'actions du checkout */}
      <div className="relative isolate h-72 overflow-hidden rounded-xl border md:h-80">
        <MapPicker position={position} onPosition={deplacer} />
        {geocodage && (
          <span className="pointer-events-none absolute top-2 end-2 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[12px] shadow-soft">
            <Loader2 className="size-3.5 animate-spin" aria-hidden /> Recherche de l&apos;adresse…
          </span>
        )}
      </div>
      <p className="text-[13px] text-muted-foreground">
        {localisation === "attente" && "Localisation en cours… "}
        {localisation === "refusee" && "Localisation refusée : la carte est centrée sur Tunis. "}
        {localisation === "indisponible" && "Position introuvable : la carte est centrée sur Tunis. "}
        Déplacez le marqueur ou cliquez sur la carte pour indiquer le point exact de livraison. Vous pouvez corriger l&apos;adresse ci-dessous.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {champ("destinataire", "Destinataire", { autoComplete: "name" })}
        {champ("telephone", "Téléphone", { inputMode: "tel", autoComplete: "tel", placeholder: "+216 22 345 678" })}
        <div className="sm:col-span-2">{champ("ligne1", "Adresse (rue, numéro)", { autoComplete: "address-line1" })}</div>
        <div className="sm:col-span-2">{champ("ligne2", "Complément (étage, code, repère) — facultatif", { autoComplete: "address-line2" })}</div>
        {champ("ville", "Ville", { autoComplete: "address-level2" })}
        {champ("codePostal", "Code postal", { inputMode: "numeric", maxLength: 4, autoComplete: "postal-code" })}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="carte-gouvernorat">Gouvernorat</Label>
          <select
            id="carte-gouvernorat"
            value={champs.gouvernorat}
            onChange={(e) => setChamps((c) => ({ ...c, gouvernorat: e.target.value as Gouvernorat }))}
            onBlur={() => setTouche((t) => ({ ...t, gouvernorat: true }))}
            className="h-11 w-full rounded-xl border bg-background px-3 text-sm"
          >
            <option value="">Choisir…</option>
            {GOUVERNORATS.map((g) => (
              <option key={g} value={g}>
                {GOUVERNORAT_LABEL[g]}
              </option>
            ))}
          </select>
          {touche.gouvernorat && erreurs.gouvernorat && <p className="text-[12px] text-danger">{erreurs.gouvernorat}</p>}
        </div>
      </div>
    </div>
  );
}
