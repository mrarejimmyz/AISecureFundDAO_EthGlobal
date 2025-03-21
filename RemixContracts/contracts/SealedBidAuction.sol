// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/ITEE.sol";

/**
 * @title SealedBidAuction - Hackathon Demo Version
 * @dev Simplified sealed-bid auction using Marlin's TEE for privacy
 */
contract SealedBidAuction {
    // Marlin TEE address
    address public immutable MARLIN_TEE_ADDRESS;

    struct Auction {
        uint256 projectId;
        uint256 endTime;
        bool finalized;
        address winner;
        uint256 winningBid;
    }

    // Simplified storage
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => bytes32)) public sealedBids;

    // Basic events
    event AuctionCreated(uint256 indexed projectId, uint256 endTime);
    event BidPlaced(uint256 indexed projectId, address indexed bidder);
    event AuctionFinalized(
        uint256 indexed projectId,
        address winner,
        uint256 winningBid
    );

    constructor(address _marlinTeeAddress) {
        MARLIN_TEE_ADDRESS = _marlinTeeAddress;
    }

    /**
     * @dev Create a simple auction with just an end time
     */
    function createAuction(uint256 projectId, uint256 duration) external {
        auctions[projectId] = Auction({
            projectId: projectId,
            endTime: block.timestamp + duration,
            finalized: false,
            winner: address(0),
            winningBid: 0
        });

        emit AuctionCreated(projectId, block.timestamp + duration);
    }

    /**
     * @dev Submit a sealed bid using TEE
     * @param projectId The auction to bid on
     * @param sealedBid The encrypted bid data (processed by TEE)
     */
    function submitBid(uint256 projectId, bytes32 sealedBid) external {
        require(block.timestamp < auctions[projectId].endTime, "Auction ended");
        require(!auctions[projectId].finalized, "Auction finalized");

        // Get attestation nonce from Marlin TEE
        bytes32 teeNonce = ITEE(MARLIN_TEE_ADDRESS).getAttestationNonce();

        // Store bid with TEE attestation binding
        sealedBids[projectId][msg.sender] = keccak256(
            abi.encodePacked(sealedBid, teeNonce)
        );

        emit BidPlaced(projectId, msg.sender);
    }

    /**
     * @dev Finalize auction with TEE-based winner determination
     * @param projectId The auction to finalize
     * @param teeResult The result from the TEE computation
     * @param teeProof Attestation proof verifying the result's authenticity
     */
    function finalizeAuction(
        uint256 projectId,
        address winner,
        uint256 winningBid,
        bytes calldata teeProof
    ) external {
        Auction storage auction = auctions[projectId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.finalized, "Already finalized");

        // Verify the result came from the TEE
        require(
            ITEE(MARLIN_TEE_ADDRESS).verifyAuctionResult(
                projectId,
                winner,
                winningBid,
                teeProof
            ),
            "Invalid TEE verification"
        );

        // Update auction with winner
        auction.winner = winner;
        auction.winningBid = winningBid;
        auction.finalized = true;

        emit AuctionFinalized(projectId, winner, winningBid);
    }

    /**
     * @dev Get current auction status (simplified for demo)
     */
    function getAuctionStatus(
        uint256 projectId
    )
        external
        view
        returns (
            uint256 endTime,
            bool finalized,
            address winner,
            uint256 winningBid
        )
    {
        Auction storage auction = auctions[projectId];
        return (
            auction.endTime,
            auction.finalized,
            auction.winner,
            auction.winningBid
        );
    }
}
