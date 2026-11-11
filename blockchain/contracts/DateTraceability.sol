// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IDateTraceability.sol";

contract DateTraceability is AccessControl, IDateTraceability {

    // --- A3 : Rôles de sécurité ---
    bytes32 public constant LOT_CREATOR_ROLE = keccak256("LOT_CREATOR_ROLE");
    bytes32 public constant STEP_ADDER_ROLE = keccak256("STEP_ADDER_ROLE");

    // --- A2 : Étapes de traçabilité ---
    enum StepType {
        Harvest,        // Récolte
        Packaging,      // Conditionnement
        Processing,     // Transformation
        Transport,      // Transport
        Distribution    // Distribution
    }

    struct TraceabilityStep {
        StepType stepType;
        uint256 date;
        string location;
        address responsibleActor;
        string documentHash; // Hash facultatif du justificatif (peut être "")
    }

    // --- A1 : Structure d'un lot ---
    struct Lot {
        string lotId;
        address producer;
        string region;
        string variety;
        uint256 harvestDate;
        bool exists;
    }

    // Stockage privé des lots et de leur historique immuable (ajout uniquement)
    mapping(string => Lot) private lots;
    mapping(string => TraceabilityStep[]) private traceabilityHistory;

    // --- A3 : Événements ---
    event LotCreated(
        string indexed lotId,
        address indexed producer,
        string region,
        string variety,
        uint256 harvestDate
    );

    event TraceabilityStepAdded(
        string indexed lotId,
        StepType stepType,
        uint256 date,
        string location,
        address indexed responsibleActor,
        string documentHash
    );

    // --- Constructeur ---
    constructor() {
        // L'adresse qui déploie le contrat reçoit tous les rôles par défaut
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LOT_CREATOR_ROLE, msg.sender);
        _grantRole(STEP_ADDER_ROLE, msg.sender);
    }

    // --- Compatibilité avec Baha & A1 ---
    function lotExists(string calldata lotId)
        external
        view
        override
        returns (bool)
    {
        return lots[lotId].exists;
    }

    // --- A1 : Création d'un lot ---
    function createLot(
        string calldata lotId,
        address producer,
        string calldata region,
        string calldata variety,
        uint256 harvestDate
    ) external onlyRole(LOT_CREATOR_ROLE) {
        require(bytes(lotId).length > 0, "Empty lot ID");
        require(!lots[lotId].exists, "Lot already exists");
        require(producer != address(0), "Invalid producer");
        require(bytes(region).length > 0, "Empty region");
        require(bytes(variety).length > 0, "Empty variety");
        require(harvestDate > 0, "Invalid harvest date");

        lots[lotId] = Lot({
            lotId: lotId,
            producer: producer,
            region: region,
            variety: variety,
            harvestDate: harvestDate,
            exists: true
        });

        emit LotCreated(lotId, producer, region, variety, harvestDate);
    }

    // --- A1 : Consultation d'un lot ---
    function getLot(string calldata lotId)
        external
        view
        returns (Lot memory)
    {
        require(lots[lotId].exists, "Lot not found");
        return lots[lotId];
    }

    // --- A2 : Ajout d'une étape de traçabilité ---
    function addTraceabilityStep(
        string calldata lotId,
        StepType stepType,
        uint256 date,
        string calldata location,
        address responsibleActor,
        string calldata documentHash
    ) external onlyRole(STEP_ADDER_ROLE) {
        require(lots[lotId].exists, "Lot not found");
        require(date > 0, "Invalid step date");
        require(bytes(location).length > 0, "Empty location");
        require(responsibleActor != address(0), "Invalid responsible actor");

        traceabilityHistory[lotId].push(
            TraceabilityStep({
                stepType: stepType,
                date: date,
                location: location,
                responsibleActor: responsibleActor,
                documentHash: documentHash
            })
        );

        emit TraceabilityStepAdded(
            lotId,
            stepType,
            date,
            location,
            responsibleActor,
            documentHash
        );
    }

    // --- A2 : Consultation de l'historique complet d'un lot ---
    function getTraceabilityHistory(string calldata lotId)
        external
        view
        returns (TraceabilityStep[] memory)
    {
        require(lots[lotId].exists, "Lot not found");
        return traceabilityHistory[lotId];
    }
}
