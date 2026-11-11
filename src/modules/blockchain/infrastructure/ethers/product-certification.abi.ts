export const PRODUCT_CERTIFICATION_ABI = [
  "function CERTIFIER_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role,address account) view returns (bool)",
  "function certificateExists(string certificateId) view returns (bool)",
  "function issueCertificate(string certificateId,string productId,string lotId,string certifierName,string certificationType,string documentHash,uint256 expiresAt)",
  "function revokeCertificate(string certificateId,string reason)",
  "function getCertificate(string certificateId) view returns (tuple(string certificateId,string productId,string lotId,address certifier,string certifierName,string certificationType,string documentHash,uint256 issuedAt,uint256 expiresAt,bool revoked,string revocationReason,uint256 revokedAt,address revokedBy,bool exists))",
  "function verifyCertificate(string certificateId,string productId,string lotId) view returns (uint8)",
  "function getProductCertificateIds(string productId) view returns (string[])",
  "function totalCertificates() view returns (uint256)",
  "function certificateIdAt(uint256 index) view returns (string)",
  "event CertificateIssued(string indexed certificateId,string indexed productId,string lotId,address indexed certifier,string certifierName,string certificationType,string documentHash,uint256 issuedAt,uint256 expiresAt)",
  "event CertificateRevoked(string indexed certificateId,address indexed revokedBy,string reason,uint256 revokedAt)",
] as const;
