// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/ITEE.sol";

/**
 * @title ResultVerification - Hackathon Demo Version
 * @dev Verifies results from Marlin TEE and Nillion SecretLLM
 */
contract ResultVerification {
    ITEE public tee;

    // Maps result hashes to verification status
    mapping(bytes32 => bool) public verifiedResults;
    // Maps AI insight hashes to verification status
    mapping(bytes32 => bool) public verifiedAiInsights;

    event ResultVerified(bytes32 indexed resultHash, bool verified);
    event AiInsightVerified(bytes32 indexed insightHash, bool verified);

    constructor(address teeAddress) {
        tee = ITEE(teeAddress);
    }

    /**
     * @dev Verify TEE execution proof for any computation
     */
    function verifyTeeResult(
        bytes32 resultHash,
        bytes memory resultProof
    ) external returns (bool) {
        // Use verifyAuctionResult with default parameters for rapid prototyping
        bool isVerified = tee.verifyAuctionResult(
            0, // Dummy project ID
            address(0), // Dummy winner address
            0, // Dummy winning bid
            resultProof
        );

        verifiedResults[resultHash] = isVerified;

        emit ResultVerified(resultHash, isVerified);
        return isVerified;
    }

    /**
     * @dev Verify AI insights from Nillion SecretLLM
     */
    function verifyAiInsight(
        bytes32 insightHash,
        bytes memory aiProof
    ) external returns (bool) {
        // Using verifyAuctionResult for AI insights too (for hackathon purposes)
        bool isVerified = tee.verifyAuctionResult(
            0, // Dummy project ID
            address(0), // Dummy winner address
            0, // Dummy winning bid
            aiProof
        );

        verifiedAiInsights[insightHash] = isVerified;

        emit AiInsightVerified(insightHash, isVerified);
        return isVerified;
    }

    /**
     * @dev Check if a specific result has been verified
     */
    function isResultVerified(bytes32 resultHash) external view returns (bool) {
        return verifiedResults[resultHash];
    }

    /**
     * @dev Check if a specific AI insight has been verified
     */
    function isAiInsightVerified(
        bytes32 insightHash
    ) external view returns (bool) {
        return verifiedAiInsights[insightHash];
    }
}
