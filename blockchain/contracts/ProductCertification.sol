// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IDateTraceability.sol";
import "./interfaces/IProductCertification.sol";

/**
 * Baha — certification indépendante des lots et produits DEGLA.
 * L'existence du lot reste exclusivement gérée par DateTraceability (Ali).
 */
contract ProductCertification is AccessControl, IProductCertification {
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");

    IDateTraceability public immutable traceability;

    mapping(string => Certificate) private certificates;
    mapping(string => string[]) private productCertificateIds;
    string[] private certificateIds;

    event CertificateIssued(
        string indexed certificateId,
        string indexed productId,
        string lotId,
        address indexed certifier,
        string certifierName,
        string certificationType,
        string documentHash,
        uint256 issuedAt,
        uint256 expiresAt
    );

    event CertificateRevoked(
        string indexed certificateId,
        address indexed revokedBy,
        string reason,
        uint256 revokedAt
    );

    constructor(address traceabilityAddress) {
        require(traceabilityAddress != address(0), "Invalid traceability contract");
        traceability = IDateTraceability(traceabilityAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
    }

    function issueCertificate(
        string calldata certificateId,
        string calldata productId,
        string calldata lotId,
        string calldata certifierName,
        string calldata certificationType,
        string calldata documentHash,
        uint256 expiresAt
    ) external onlyRole(CERTIFIER_ROLE) {
        require(bytes(certificateId).length > 0, "Empty certificate ID");
        require(!certificates[certificateId].exists, "Certificate already exists");
        require(bytes(productId).length > 0, "Empty product ID");
        require(bytes(lotId).length > 0, "Empty lot ID");
        require(traceability.lotExists(lotId), "Lot not found");
        require(bytes(certifierName).length > 0, "Empty certifier name");
        require(bytes(certificationType).length > 0, "Empty certification type");
        require(bytes(documentHash).length > 0, "Empty document hash");
        require(expiresAt > block.timestamp, "Invalid expiration date");

        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            productId: productId,
            lotId: lotId,
            certifier: msg.sender,
            certifierName: certifierName,
            certificationType: certificationType,
            documentHash: documentHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false,
            revocationReason: "",
            revokedAt: 0,
            revokedBy: address(0),
            exists: true
        });

        productCertificateIds[productId].push(certificateId);
        certificateIds.push(certificateId);

        emit CertificateIssued(
            certificateId,
            productId,
            lotId,
            msg.sender,
            certifierName,
            certificationType,
            documentHash,
            block.timestamp,
            expiresAt
        );
    }

    function revokeCertificate(string calldata certificateId, string calldata reason)
        external
        onlyRole(CERTIFIER_ROLE)
    {
        Certificate storage certificate = certificates[certificateId];
        require(certificate.exists, "Certificate not found");
        require(!certificate.revoked, "Certificate already revoked");
        require(bytes(reason).length > 0, "Empty revocation reason");
        require(
            certificate.certifier == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only issuer or admin can revoke"
        );

        certificate.revoked = true;
        certificate.revocationReason = reason;
        certificate.revokedAt = block.timestamp;
        certificate.revokedBy = msg.sender;

        emit CertificateRevoked(certificateId, msg.sender, reason, block.timestamp);
    }

    function certificateExists(string calldata certificateId) external view override returns (bool) {
        return certificates[certificateId].exists;
    }

    function getCertificate(string calldata certificateId)
        external
        view
        override
        returns (Certificate memory)
    {
        require(certificates[certificateId].exists, "Certificate not found");
        return certificates[certificateId];
    }

    function verifyCertificate(
        string calldata certificateId,
        string calldata productId,
        string calldata lotId
    ) external view override returns (CertificateStatus) {
        Certificate storage certificate = certificates[certificateId];
        if (!certificate.exists) return CertificateStatus.Nonexistent;
        if (!_same(certificate.productId, productId) || !_same(certificate.lotId, lotId)) {
            return CertificateStatus.Nonexistent;
        }
        if (certificate.revoked) return CertificateStatus.Revoked;
        if (certificate.expiresAt <= block.timestamp) return CertificateStatus.Expired;
        return CertificateStatus.Valid;
    }

    function getProductCertificateIds(string calldata productId)
        external
        view
        override
        returns (string[] memory)
    {
        return productCertificateIds[productId];
    }

    function totalCertificates() external view returns (uint256) {
        return certificateIds.length;
    }

    function certificateIdAt(uint256 index) external view returns (string memory) {
        require(index < certificateIds.length, "Certificate index out of bounds");
        return certificateIds[index];
    }

    function _same(string memory left, string memory right) private pure returns (bool) {
        return keccak256(bytes(left)) == keccak256(bytes(right));
    }
}
