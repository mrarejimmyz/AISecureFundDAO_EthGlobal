# test_marlin_tee.py
from tee.marlin_tee_integration.marlin_tee import process_votes_in_tee
import json

def main():
    # Sample votes for testing - mix of JSON and homomorphically encrypted votes
    votes = [
        # Traditional JSON votes
        {"option": "inFavor", "timestamp": 1742450000000},
        {"option": "against", "timestamp": 1742453600000},
        {"option": "inFavor", "timestamp": 1742457200000},
        {"option": "abstain", "timestamp": 1742457200000},
        
        # Homomorphically encrypted votes (simulated) - hex strings
        # First digit encodes the vote: 1=inFavor, 0=against, 2=abstain
        "0x1a7b2c3d4e5f6789", # inFavor
        "0x0d5f6a7b8c9d0e1f", # against
        "0x2c3d4e5f6a7b8c9d"  # abstain
    ]
    
    proposal_id = "PROP-123"
    
    print("\n=== Testing MarlinTEE with Mixed Vote Types ===")
    
    # Process the votes
    print("Processing votes in TEE...")
    results = process_votes_in_tee(votes, proposal_id)
    
    # Check for TEE attestation proof
    print(f"\nTEE Attestation Proof: {results.get('tee_proof', 'Not Found')}")
    
    # Pretty print the results
    print("\nFull Results:")
    print(json.dumps(results, indent=4))
    
    # Verify vote counts
    vote_counts = results["results"]["counts"]
    print("\nVote Summary:")
    print(f"In Favor: {vote_counts.get('inFavor', 0)}")
    print(f"Against: {vote_counts.get('against', 0)}")
    print(f"Abstain: {vote_counts.get('abstain', 0)}")
    print(f"Total Votes: {results['results']['total']}")
    
    print("\n=== Verifying 0G Storage ===")
    print(f"Results stored with key: {results.get('storage_key', 'Not Stored')}")

if __name__ == "__main__":
    main()
