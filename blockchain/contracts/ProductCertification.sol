// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IDateTraceability.sol";

contract ProductCertification is AccessControl {
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");

    enum CertificateStatus { Valid, Expired, Revoked }

    struct Certificate {
        bytes32 certificateId;
        string productId;
        string lotId;
        address certifier;
        string certifierOrg;
        string certType;
        string documentHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        string revocationReason;
        bool exists;
    }

    IDateTraceability public immutable traceability;

    mapping(string => Certificate) private certificates; // productId => certificate
    mapping(bytes32 => string) private certIdToProduct;

    event CertificateIssued(
        bytes32 indexed certificateId,
        string indexed productId,
        string lotId,
        address indexed certifier,
        string certType,
        uint256 issuedAt,
        uint256 expiresAt
    );

    event CertificateRevoked(
        bytes32 indexed certificateId,
        string indexed productId,
        address indexed revoker,
        string reason
    );

    constructor(address traceabilityAddress) {
        require(traceabilityAddress != address(0), "Invalid traceability address");
        traceability = IDateTraceability(traceabilityAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
    }

    function issueCertificate(
        string calldata productId,
        string calldata lotId,
        string calldata certifierOrg,
        string calldata certType,
        string calldata documentHash,
        uint256 expiresAt
    ) external onlyRole(CERTIFIER_ROLE) returns (bytes32) {
        require(bytes(productId).length > 0, "Empty product ID");
        require(bytes(lotId).length > 0, "Empty lot ID");
        require(traceability.lotExists(lotId), "Lot does not exist");
        require(!certificates[productId].exists, "Certificate already exists");
        require(bytes(certifierOrg).length > 0, "Empty certifier org");
        require(bytes(certType).length > 0, "Empty cert type");
        require(expiresAt > block.timestamp, "Invalid expiry");

        bytes32 certificateId = keccak256(abi.encodePacked(productId, lotId, block.timestamp, msg.sender));

        certificates[productId] = Certificate({
            certificateId: certificateId,
            productId: productId,
            lotId: lotId,
            certifier: msg.sender,
            certifierOrg: certifierOrg,
            certType: certType,
            documentHash: documentHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false,
            revocationReason: "",
            exists: true
        });
        certIdToProduct[certificateId] = productId;

        emit CertificateIssued(certificateId, productId, lotId, msg.sender, certType, block.timestamp, expiresAt);
        return certificateId;
    }

    function getCertificate(string calldata productId)
        external
        view
        returns (Certificate memory)
    {
        require(certificates[productId].exists, "Certificate not found");
        return certificates[productId];
    }

    function verifyCertificate(string calldata productId)
        external
        view
        returns (bool valid, CertificateStatus status)
    {
        Certificate memory c = certificates[productId];
        if (!c.exists) return (false, CertificateStatus.Revoked); // not found treated invalid
        if (c.revoked) return (false, CertificateStatus.Revoked);
        if (block.timestamp > c.expiresAt) return (false, CertificateStatus.Expired);
        return (true, CertificateStatus.Valid);
    }

    function revokeCertificate(string calldata productId, string calldata reason)
        external
        onlyRole(CERTIFIER_ROLE)
    {
        require(certificates[productId].exists, "Certificate not found");
        require(!certificates[productId].revoked, "Already revoked");
        require(bytes(reason).length > 0, "Empty reason");

        certificates[productId].revoked = true;
        certificates[productId].revocationReason = reason;

        emit CertificateRevoked(certificates[productId].certificateId, productId, msg.sender, reason);
    }
}
