export const PRODUCT_CERTIFICATION_ABI = [
  "function getCertificate(string productId) view returns (tuple(bytes32 certificateId, string productId, string lotId, address certifier, string certifierOrg, string certType, string documentHash, uint256 issuedAt, uint256 expiresAt, bool revoked, string revocationReason, bool exists))",
  "function verifyCertificate(string productId) view returns (bool valid, uint8 status)",
];
