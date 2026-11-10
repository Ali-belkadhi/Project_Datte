import { Label } from "@/components/ui/label";

/** Champ de formulaire : libellé + contrôle + message d'erreur. */
export function FormField({ id, label, erreur, aide, children }: { id: string; label: React.ReactNode; erreur?: string; aide?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {erreur ? <p className="text-[13px] text-danger">{erreur}</p> : aide ? <p className="text-[13px] text-muted-foreground">{aide}</p> : null}
    </div>
  );
}
