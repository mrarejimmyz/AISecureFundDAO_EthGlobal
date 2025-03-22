# integrations/0g_storage/storage_utils.py

from integrations.og_storage.storage_manager import StorageManager
import json
import os

def store_voting_results(proposal_id, results):
    storage_manager = StorageManager()
    
    # Create temporary file with voting results
    results_file = f"vote_results_{proposal_id}.json"
    with open(results_file, "w") as f:
        json.dump(results, f)
    
    # Upload file to 0G Storage
    upload_result = storage_manager.upload_file(results_file)
    root_hash = upload_result["rootHash"]
    
    # Store metadata using key-value storage
    storage_manager.store_metadata(f"vote_{proposal_id}", {
        "root_hash": root_hash,
        "timestamp": results["timestamp"],
        "total_votes": results["totalVotes"]
    })
    
    # Clean up temporary file
    os.remove(results_file)
    
    return root_hash

def store_auction_results(project_id, results):
    storage_manager = StorageManager()
    
    # Create temporary file with auction results
    results_file = f"auction_results_{project_id}.json"
    with open(results_file, "w") as f:
        json.dump(results, f)
    
    # Upload file to 0G Storage
    upload_result = storage_manager.upload_file(results_file)
    root_hash = upload_result["rootHash"]
    
    # Store metadata using key-value storage
    storage_manager.store_metadata(f"auction_{project_id}", {
        "root_hash": root_hash,
        "winner": results["winner"],
        "winning_amount": results["winningAmount"],
        "timestamp": results["timestamp"]
    })
    
    # Clean up temporary file
    os.remove(results_file)
    
    return root_hash
