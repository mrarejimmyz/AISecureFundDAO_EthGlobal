// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITEE {
    function verifyProof(bytes memory proof) external view returns (bool);
}
