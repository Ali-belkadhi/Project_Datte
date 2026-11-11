export const CERTIFICATE_STATUS_LABELS = {
  0: "Inexistant",
  1: "Valide",
  2: "Expiré",
  3: "Révoqué",
} as const;

export type CertificateStatus = 0 | 1 | 2 | 3;

export interface BlockchainCertificate {
  certificateId: string;
  productId: string;
  lotId: string;
  certifier: string;
  certifierName: string;
  certificationType: string;
  documentHash: string;
  issuedAt: number;
  expiresAt: number;
  revoked: boolean;
  revocationReason: string;
  revokedAt: number;
  revokedBy: string;
  exists: boolean;
}

export interface VerifiedCertificate extends BlockchainCertificate {
  status: CertificateStatus;
}

export interface PublicCertification {
  configured: boolean;
  certificates: VerifiedCertificate[];
  error?: string;
}

export interface PublicCertificationConfig {
  chainId: number;
  certificationAddress: string;
}
