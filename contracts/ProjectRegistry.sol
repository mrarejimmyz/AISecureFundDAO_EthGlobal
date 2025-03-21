// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProjectRegistry {
    struct Project {
        uint256 id;
        string name;
        address proposer;
        uint256 fundingGoal;
        bool isActive;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    function submitProject(string memory name, uint256 fundingGoal) public {
        projectCount++;
        projects[projectCount] = Project(
            projectCount,
            name,
            msg.sender,
            fundingGoal,
            true
        );
    }
}
