import "server-only";
import { z } from "zod";
import type { Role } from "@/types/enums";
import { fail, ok, type ActionResult } from "./action-result";
import { ForbiddenError, NonImplementeError, NotFoundError } from "./errors";
import { requireRole } from "./rbac";

/**
 * Squelette commun d'une Server Action :
 *   1. validation Zod (schéma partagé de lib/validation)
 *   2. contrôle du rôle (session factice aujourd'hui, Auth.js demain)
 *   3. appel du handler (service métier)
 *   4. conversion des erreurs connues en ActionResult
 */
export async function runAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  roles: Role[],
  handler: (data: z.output<S>) => Promise<T>,
  message?: string,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", z.flattenError(parsed.error));
  try {
    await requireRole(...roles);
    return ok(await handler(parsed.data), message);
  } catch (e) {
    if (e instanceof ForbiddenError) return fail("FORBIDDEN", undefined, e.message);
    if (e instanceof NotFoundError) return fail("NOT_FOUND", undefined, e.message);
    if (e instanceof NonImplementeError) return fail("NOT_IMPLEMENTED", undefined, e.message);
    console.error(e);
    return fail("INTERNE");
  }
}
