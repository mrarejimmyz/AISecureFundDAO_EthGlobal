// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./interfaces/ITEE.sol";
import "./ResultVerification.sol";

/**
 * @title PrivateVoting - Hackathon Demo Version
 * @dev Privacy-preserving voting using Marlin's TEE with Nillion AI integration
 */
contract PrivateVoting {
    ITEE public tee;
    ResultVerification public resultVerification;

    struct Proposal {
        uint256 projectId;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        bool approved;
        // Hash of AI insights from Nillion SecretLLM
        bytes32 aiInsightsHash;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => bytes32[]) public encryptedVotes;

    event ProposalCreated(
        uint256 indexed projectId,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(uint256 indexed projectId, address indexed voter);
    event ProposalFinalized(
        uint256 indexed projectId,
        bool approved,
        bytes32 aiInsightsHash
    );

    constructor(address teeAddress, address resultVerificationAddress) {
        tee = ITEE(teeAddress);
        resultVerification = ResultVerification(resultVerificationAddress);
    }

    /**
     * @dev Create a new proposal for voting
     */
    function createProposal(uint256 projectId, uint256 duration) external {
        proposals[projectId] = Proposal({
            projectId: projectId,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            finalized: false,
            approved: false,
            aiInsightsHash: bytes32(0)
        });

        emit ProposalCreated(
            projectId,
            block.timestamp,
            block.timestamp + duration
        );
    }

    /**
     * @dev Cast an encrypted vote using Marlin TEE
     */
    function castVote(uint256 projectId, bytes32 encryptedVote) external {
        require(block.timestamp < proposals[projectId].endTime, "Voting ended");
        require(!proposals[projectId].finalized, "Proposal finalized");

        encryptedVotes[projectId].push(encryptedVote);

        emit VoteCast(projectId, msg.sender);
    }

    /**
     * @dev Finalize proposal with TEE verification and AI insights
     */
    function finalizeProposal(
        uint256 projectId,
        bool approved,
        bytes32 aiInsightsHash,
        bytes calldata teeProof
    ) external {
        Proposal storage proposal = proposals[projectId];
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(!proposal.finalized, "Already finalized");

        // Verify the result came from the TEE
        // Using verifyAuctionResult with adapted parameters for rapid prototyping
        require(
            tee.verifyAuctionResult(
                projectId, // projectId remains the same
                approved ? msg.sender : address(0), // Use msg.sender as "winner" if approved
                approved ? 1 : 0, // Use 1 as "winningBid" if approved, 0 if not
                teeProof
            ),
            "Invalid TEE verification"
        );

        // Update proposal with results and AI insights
        proposal.finalized = true;
        proposal.approved = approved;
        proposal.aiInsightsHash = aiInsightsHash;

        emit ProposalFinalized(projectId, approved, aiInsightsHash);
    }

    /**
     * @dev Check if a project has been approved by DAO voting
     */
    function isProjectApproved(uint256 projectId) external view returns (bool) {
        return proposals[projectId].finalized && proposals[projectId].approved;
    }

    /**
     * @dev Get proposal details including AI insights
     */
    function getProposalDetails(
        uint256 projectId
    )
        external
        view
        returns (
            uint256 startTime,
            uint256 endTime,
            bool finalized,
            bool approved,
            bytes32 aiInsightsHash
        )
    {
        Proposal storage proposal = proposals[projectId];
        return (
            proposal.startTime,
            proposal.endTime,
            proposal.finalized,
            proposal.approved,
            proposal.aiInsightsHash
        );
    }
}
