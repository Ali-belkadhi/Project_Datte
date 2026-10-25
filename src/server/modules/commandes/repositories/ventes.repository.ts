import "server-only";
import type { ScenarioAssistantSource } from "@/types/domain";

export interface AssistantRepository {
  scenarios(): Promise<ScenarioAssistantSource[]>;
  suggestions(): Promise<string[]>;
  reponseGenerique(): Promise<string>;
}
