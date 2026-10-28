import "server-only";

export interface ModerationPort {
  masquerProduit(id: string): Promise<void>;
  masquerAvis(id: string): Promise<void>;
}

export const mockModerationPort: ModerationPort = {
  async masquerProduit(id) { console.log("mock masquerProduit", id); },
  async masquerAvis(id) { console.log("mock masquerAvis", id); },
};

let impl: ModerationPort = mockModerationPort;
export function setModerationPort(p: ModerationPort) { impl = p; }
export function getModerationPort(): ModerationPort { return impl; }