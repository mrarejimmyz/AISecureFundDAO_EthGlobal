// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ITEE.sol";

contract PrivateVoting {
    ITEE public tee;

    mapping(uint256 => bytes32[]) public encryptedVotes;

    constructor(address teeAddress) {
        tee = ITEE(teeAddress);
    }

    function castVote(uint256 projectId, bytes32 encryptedVote) public {
        encryptedVotes[projectId].push(encryptedVote);
    }
}
