"use client";
import { useState } from "react";
import { Box, Images } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProduitVisuel } from "@/components/illustrations/product-illustration";
import { LazyProductViewer, LazyScene } from "@/components/three";
import { cn } from "@/lib/utils";
import type { Produit } from "@/types/domain";

/** Galerie : onglets « Photos » (photos réelles, sinon 4 variantes d'illustration) et « Voir en 3D » (ProductViewer). */
export function ProductGallery({ produit }: { produit: Produit }) {
  const [photo, setPhoto] = useState(0);
  const a3D = produit.modele3D !== null;
  const nbVues = produit.photos?.length ? produit.photos.length : 4;
  return (
    <Tabs defaultValue={a3D ? "3d" : "photos"} className="gap-3">
      <TabsList className="w-full sm:w-fit">
        <TabsTrigger value="photos" className="gap-1.5">
          <Images aria-hidden /> Photos
        </TabsTrigger>
        <TabsTrigger value="3d" disabled={!a3D} className="gap-1.5">
          <Box aria-hidden /> Voir en 3D
        </TabsTrigger>
      </TabsList>
      <TabsContent value="photos" className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-3xl border bg-sand">
          <ProduitVisuel produit={produit} variante={photo} />
        </div>
        {nbVues > 1 && (
          <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Choisir une photo">
            {Array.from({ length: Math.min(nbVues, 8) }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={photo === i}
                aria-label={`Photo ${i + 1}`}
                onClick={() => setPhoto(i)}
                className={cn("aspect-square overflow-hidden rounded-xl border-2 bg-sand transition-colors", photo === i ? "border-primary" : "border-transparent hover:border-border")}
              >
                <ProduitVisuel produit={produit} variante={i} />
              </button>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="3d">
        {produit.modele3D && (
          <LazyScene
            className="aspect-square overflow-hidden rounded-3xl border bg-sand"
            eager
            fallback={<ProduitVisuel produit={produit} />}
          >
            <LazyProductViewer source={produit.modele3D} label={`Vue 3D interactive : ${produit.nom}`} />
          </LazyScene>
        )}
        <p className="mt-2 text-[13px] text-muted-foreground">Faites tourner le produit, zoomez sur la peau, comparez les calibres.</p>
      </TabsContent>
    </Tabs>
  );
}
