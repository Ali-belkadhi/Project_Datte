// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Interface minimale et stable partagée avec les futurs contrats consommateurs.
 * Elle ne transfère aucune responsabilité de traçabilité à ces contrats.
 */
interface IDateTraceability {
    function lotExists(string calldata lotId) external view returns (bool);
}
