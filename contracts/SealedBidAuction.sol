// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SealedBidAuction {
    struct Bid {
        address bidder;
        uint256 amount;
        bytes32 sealedBid;
    }

    mapping(uint256 => Bid[]) public bids;

    function submitBid(uint256 projectId, bytes32 sealedBid) public payable {
        bids[projectId].push(Bid(msg.sender, msg.value, sealedBid));
    }
}
