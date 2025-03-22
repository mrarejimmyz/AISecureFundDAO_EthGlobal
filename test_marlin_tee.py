# test_marlin_tee.py
from tee.marlin_tee_integration.marlin_tee import process_votes_in_tee
import json

def main():
    # Sample encrypted votes for testing
    encrypted_votes = [
        {"option": "inFavor", "timestamp": 1742450000000},
        # {"option": "against", "timestamp": 1742453600000},
        # {"option": "inFavor", "timestamp": 1742457200000},
        # {"option": "abstain", "timestamp": 1742457200000},
        # {"option": "inFavor", "timestamp": 1742457200000},
        # {"option": "inFavor", "timestamp": 1742457600000}
    ]
    
    proposal_id = "PROP-123"
    
    # Process the votes
    print("Processing votes in TEE...")
    results = process_votes_in_tee(encrypted_votes, proposal_id)
    
    # Pretty print the results
    print(json.dumps(results, indent=4))

if __name__ == "__main__":
    main()
