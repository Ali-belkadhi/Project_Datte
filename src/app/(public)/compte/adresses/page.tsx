import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AddressActions, AddressCard, AddressFormSheet } from "@/features/comptes/profil";
import { pageMetadata } from "@/lib/seo";
import { getAdresses } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Mes adresses");

/** Adresses (module A) : cartes, adresse par défaut, ajout et modification dans une Sheet. */
export default async function AdressesPage() {
  const adresses = await getAdresses();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Mes adresses" description="Livraison partout en Tunisie, dans les 24 gouvernorats." actions={<AddressFormSheet />} />
      <ul className="grid gap-4 md:grid-cols-2">
        {adresses.map((a) => (
          <li key={a.id}>
            <AddressCard
              adresse={a}
              actions={
                <>
                  <AddressFormSheet
                    adresse={a}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Pencil aria-hidden /> Modifier
                      </Button>
                    }
                  />
                  <AddressActions adresse={a} />
                </>
              }
            />
          </li>
        ))}
      </ul>
    </>
  );
}
