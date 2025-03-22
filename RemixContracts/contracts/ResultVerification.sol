// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ITEE.sol";

contract ResultVerification {
    ITEE public tee;

    constructor(address teeAddress) {
        tee = ITEE(teeAddress);
    }

    function verifyResult(bytes memory resultProof) public view returns (bool) {
        return tee.verifyProof(resultProof);
    }
}
