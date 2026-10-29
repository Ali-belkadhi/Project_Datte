import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Onglets de la fiche produit (Description, Caractéristiques, La variété, Avis, Livraison et retours). */
export function ProductTabs({
  description,
  caracteristiques,
  variete,
  avis,
  nombreAvis,
}: {
  description: React.ReactNode;
  caracteristiques: React.ReactNode;
  variete?: React.ReactNode;
  avis: React.ReactNode;
  nombreAvis: number;
}) {
  return (
    <Tabs defaultValue="description" className="gap-6">
      <TabsList variant="line" className="scrollbar-none h-auto w-full justify-start gap-4 overflow-x-auto border-b pb-1">
        <TabsTrigger value="description" className="flex-none">Description</TabsTrigger>
        <TabsTrigger value="caracteristiques" className="flex-none">Caractéristiques</TabsTrigger>
        {variete && <TabsTrigger value="variete" className="flex-none">La variété</TabsTrigger>}
        <TabsTrigger value="avis" id="avis" className="flex-none">Avis ({nombreAvis})</TabsTrigger>
        <TabsTrigger value="livraison" className="flex-none">Livraison et retours</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="max-w-3xl text-[15px] leading-relaxed">{description}</TabsContent>
      <TabsContent value="caracteristiques" className="max-w-3xl">{caracteristiques}</TabsContent>
      {variete && <TabsContent value="variete">{variete}</TabsContent>}
      <TabsContent value="avis">{avis}</TabsContent>
      <TabsContent value="livraison" className="max-w-3xl space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Expédition par le vendeur.</strong> Chaque vendeur prépare et expédie sa partie de votre commande : si votre panier
          contient plusieurs boutiques, vous recevrez plusieurs colis, chacun avec son numéro de suivi.
        </p>
        <p>
          <strong className="text-foreground">Délais.</strong> Standard en 3 à 5 jours ouvrés partout en Tunisie, express en 24 à 48 h dans les grandes villes.
        </p>
        <p>
          <strong className="text-foreground">Retours.</strong> Produit abîmé ou non conforme ? Signalez-le depuis votre commande sous 48 h : nous arbitrons et vous
          remboursons si nécessaire.
        </p>
      </TabsContent>
    </Tabs>
  );
}
