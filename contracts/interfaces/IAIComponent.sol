// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IAIComponent {
    function analyzeData(bytes memory data) external returns (bytes memory);
}
