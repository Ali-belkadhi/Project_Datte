// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IProductCertification {
    enum CertificateStatus {
        Nonexistent,
        Valid,
        Expired,
        Revoked
    }

    struct Certificate {
        string certificateId;
        string productId;
        string lotId;
        address certifier;
        string certifierName;
        string certificationType;
        string documentHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        string revocationReason;
        uint256 revokedAt;
        address revokedBy;
        bool exists;
    }

    function certificateExists(string calldata certificateId) external view returns (bool);

    function getCertificate(string calldata certificateId) external view returns (Certificate memory);

    function verifyCertificate(
        string calldata certificateId,
        string calldata productId,
        string calldata lotId
    ) external view returns (CertificateStatus);

    function getProductCertificateIds(string calldata productId) external view returns (string[] memory);
}
