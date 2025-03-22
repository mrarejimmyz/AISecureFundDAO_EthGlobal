# tee/marlin_tee_integration/marlin_tee.py

from ai.nillion_integration.secret_llm import NillionSecretLLM
import time
from collections import Counter
import json
# Add this import
from integrations.og_storage.storage_utils import store_voting_results, store_auction_results

# Initialize Nillion SecretLLM client
secret_llm = NillionSecretLLM()

def process_votes_in_tee(encrypted_votes, proposal_id):
    # Existing vote processing code...
    
    # Process the encrypted votes
    parsed_votes = [v if isinstance(v, dict) else json.loads(v) for v in encrypted_votes]
    
    # Count votes by option
    vote_options = ['inFavor', 'against', 'abstain']
    vote_counts = {}
    for option in vote_options:
        votes_for_option = [v for v in parsed_votes if v.get('option') == option]
        vote_counts[option] = len(votes_for_option)
    
    # Generate timeline data
    timeline_data = {}
    for vote in parsed_votes:
        timestamp = vote.get('timestamp', int(time.time() * 1000))
        hour = timestamp // 3600000 * 3600000
        if hour not in timeline_data:
            timeline_data[hour] = 0
        timeline_data[hour] += 1
    
    # Prepare final vote results
    vote_results = {
        "proposalId": proposal_id,
        "counts": vote_counts,
        "total": len(encrypted_votes),
        "timestamp": int(time.time() * 1000),
        "totalVotes": len(encrypted_votes)
    }
    
    # Get AI insights
    insights = secret_llm.analyze_voting_patterns({
        "proposal_id": proposal_id,
        "total_votes": len(encrypted_votes),
        "vote_distribution": vote_counts,
        "voting_timeline": timeline_data
    })
    
    # Store results in 0G Storage
    storage_hash = store_voting_results(proposal_id, vote_results)
    
    return {
        "results": vote_results,
        "ai_insights": insights,
        "storage_hash": storage_hash  # Include storage reference
    }

# Add function for processing auction results
def process_auction_bids(sealed_bids, project_id):
    # Process bids
    # ... your bid processing logic ...
    
    # Example auction results
    auction_results = {
        "winner": "0x123abc...",
        "winningAmount": 1000,
        "totalBids": len(sealed_bids),
        "timestamp": int(time.time() * 1000)
    }
    
    # Store results in 0G Storage
    storage_hash = store_auction_results(project_id, auction_results)
    
    return {
        "results": auction_results,
        "storage_hash": storage_hash
    }
