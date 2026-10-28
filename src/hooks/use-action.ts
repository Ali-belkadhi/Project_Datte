"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/types/action-result";

/**
 * Appelle une Server Action et affiche le toast standard (message serveur ou erreur).
 * Usage : const { run, pending } = useAction(majProfil); run(valeurs)
 */
export function useAction<I, T>(action: (input: I) => Promise<ActionResult<T>>, opts?: { onSuccess?: (data: T) => void; silencieux?: boolean }) {
  const [pending, startTransition] = useTransition();
  const run = (input: I) =>
    new Promise<ActionResult<T>>((resolve) => {
      startTransition(async () => {
        const res = await action(input);
        if (res.ok) {
          if (!opts?.silencieux) toast.success(res.message ?? "Enregistré.");
          opts?.onSuccess?.(res.data);
        } else {
          toast.error(res.error.message);
        }
        resolve(res);
      });
    });
  return { run, pending };
}
