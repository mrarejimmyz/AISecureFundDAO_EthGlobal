// contracts/interfaces/INethermindAI.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INethermindAI {
    /**
     * @dev Verifies that an AI-generated strategy meets DAO requirements
     * @param strategyId The identifier of the AI-generated strategy
     * @param strategyHash Hash of the strategy parameters
     * @param aiSignature Signature proving AI origin
     * @return valid Whether the strategy is valid and verified
     */
    function verifyAIStrategy(
        uint256 strategyId,
        bytes32 strategyHash,
        bytes calldata aiSignature
    ) external view returns (bool valid);

    /**
     * @dev Updates DAO parameters based on AI recommendations
     * @param paramType Type of parameter to update
     * @param newValue New value for the parameter
     * @param aiProof Proof that this recommendation comes from authorized AI
     */
    function updateAIParameters(
        bytes32 paramType,
        uint256 newValue,
        bytes calldata aiProof
    ) external;
}
