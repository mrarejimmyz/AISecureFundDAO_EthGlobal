const { handle } = require('./process_votes_and_bids');

async function test() {
    const voteRequest = JSON.stringify({
        type: "vote",
        proposalId: "1",
        votes: ["encryptedVote1", "encryptedVote2"]
    });

    const bidRequest = JSON.stringify({
        type: "bid",
        projectId: "1",
        bids: ["sealedBid1", "sealedBid2"]
    });

    console.log("Testing Vote Processing:");
    console.log(await handle(voteRequest));

    console.log("\nTesting Bid Processing:");
    console.log(await handle(bidRequest));
}

test();
