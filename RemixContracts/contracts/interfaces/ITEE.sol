// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITEE {
    function getAttestationNonce() external view returns (bytes32);

    function verifyAuctionResult(
        uint256 projectId,
        address winner,
        uint256 winningBid,
        bytes calldata teeProof
    ) external view returns (bool);
}
