# tee/marlin_tee_integration/marlin_tee.py

from ai.nillion_integration.secret_llm import NillionSecretLLM
import time
from collections import Counter
import json
# Correct the import path (0g not og)
from integrations.og_storage.storage_utils import store_voting_results, store_auction_results

# Initialize Nillion SecretLLM client
secret_llm = NillionSecretLLM()

def process_votes_in_tee(encrypted_votes, proposal_id):
    # Add processing code for encrypted votes
    # Parse encrypted votes if they are passed as strings
    parsed_votes = [v if isinstance(v, dict) else json.loads(v) for v in encrypted_votes]
    
    # Count votes by option
    vote_options = ['inFavor', 'against', 'abstain']
    vote_counts = {}
    for option in vote_options:
        votes_for_option = [v for v in parsed_votes if v.get('option') == option]
        vote_counts[option] = len(votes_for_option)
    
    # Generate timeline data (timestamp-based analysis)
    timeline_data = {}
    for vote in parsed_votes:
        timestamp = vote.get('timestamp', int(time.time() * 1000))
        hour = timestamp // 3600000 * 3600000  # Group by hour
        if hour not in timeline_data:
            timeline_data[hour] = 0
        timeline_data[hour] += 1
    
    # Prepare final vote results
    vote_results = {
        "proposalId": proposal_id,
        "counts": vote_counts,
        "total": len(encrypted_votes)
    }
    
    # Get AI insights
    insights = secret_llm.analyze_voting_patterns({
        "proposal_id": proposal_id,
        "total_votes": len(encrypted_votes),
        "vote_distribution": vote_counts,
        "voting_timeline": timeline_data
    })
    
    # Store metadata using key-value storage (working)
    from integrations.og_storage.storage_manager import StorageManager
    storage_manager = StorageManager()
    
    # Store vote results as metadata instead of blob
    metadata_key = f"vote_results_{proposal_id}"
    storage_manager.store_metadata(metadata_key, {
        "results": vote_results,
        "timestamp": int(time.time() * 1000),
        "ai_insights": insights
    })
    
    return {
        "results": vote_results,
        "ai_insights": insights,
        "storage_key": metadata_key  # Return the key used for storage
    }
