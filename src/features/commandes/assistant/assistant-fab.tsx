"use client";
import { Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AssistantChat } from "./assistant-chat";
import type { DonneesAssistant } from "./use-scripted-assistant";

/** Pastille flottante « Assistant » (desktop : catalogue, fiche produit) qui ouvre le chat dans une Sheet. */
export function AssistantFab({ data }: { data: DonneesAssistant }) {
  return (
    <Sheet>
      <SheetTrigger className="fixed end-6 bottom-6 z-40 hidden h-14 items-center gap-2 rounded-full bg-night ps-4 pe-5 font-semibold text-cream shadow-lift transition-transform hover:scale-[1.03] lg:inline-flex">
        <Sparkles className="size-5 text-brand-light" aria-hidden />
        Assistant
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetTitle className="sr-only">Assistant DEGLA</SheetTitle>
        <SheetDescription className="sr-only">Conseils, recherche et suivi de commande</SheetDescription>
        <AssistantChat data={data} compact />
      </SheetContent>
    </Sheet>
  );
}
