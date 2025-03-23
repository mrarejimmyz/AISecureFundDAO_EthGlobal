# tee/marlin_tee_integration/marlin_tee.py

from ai.nillion_integration.secret_llm import NillionSecretLLM
import time
import json
import hashlib
from typing import List, Dict, Union, Any
# Correct the import path (0g not og)
from integrations.og_storage.storage_utils import store_voting_results, store_auction_results

# Initialize Nillion SecretLLM client
secret_llm = NillionSecretLLM()

def setup_seal_context():
    """
    Mock function to set up homomorphic encryption context
    In a real implementation, this would initialize the SEAL library
    """
    # For demo purposes, just return a dictionary with mock parameters
    return {
        "scheme": "BFV",
        "poly_modulus_degree": 4096,
        "bit_sizes": [36, 36, 37],
        "plain_modulus": 65537
    }

def generate_attestation_proof(results: Dict, proposal_id) -> str:
    """Generate cryptographic proof that computations were done in TEE"""
    # In production: Create actual TEE attestation
    # For demo: Create a deterministic hash based on results and proposal ID
    result_str = f"{proposal_id}:{results['inFavor']}:{results['against']}:{results['abstain']}"
    return f"0x{hashlib.sha256(result_str.encode()).hexdigest()[:16]}"

def process_votes_in_tee(encrypted_votes: List[Union[str, Dict, bytes]], proposal_id) -> Dict[str, Any]:
    """
    Process votes inside TEE environment.
    Handles both JSON-formatted votes and hex-encoded bytes32 votes.
    """
    # Set up encryption context for homomorphic votes
    encryption_context = setup_seal_context()
    
    # Detect vote format and process accordingly
    vote_counts = {'inFavor': 0, 'against': 0, 'abstain': 0}
    parsed_votes = []
    timeline_data = {}
    
    for vote in encrypted_votes:
        # Handle bytes32 votes from blockchain
        if isinstance(vote, (bytes, bytearray)) or (isinstance(vote, str) and vote.startswith('0x')):
            try:
                # For hackathon demo - extract vote from first bytes of the hash
                # In a real implementation, this would use proper homomorphic decryption
                
                # If it's a hex string, convert first 2 bytes to an integer
                if isinstance(vote, str):
                    if vote.startswith('0x'):
                        vote_hex = vote[2:6]  # Take first 2 bytes after 0x
                    else:
                        vote_hex = vote[0:4]  # Take first 2 bytes
                    
                    vote_value = int(vote_hex, 16) % 3  # Get value modulo 3
                else:
                    # If it's bytes, take first byte
                    vote_value = vote[0] % 3
                
                # Map to vote options (0=against, 1=inFavor, 2=abstain)
                vote_mapping = {0: 'against', 1: 'inFavor', 2: 'abstain'}
                vote_option = vote_mapping[vote_value]
                
                vote_counts[vote_option] += 1
                
                # Create a timestamp for this vote for timeline
                timestamp = int(time.time() * 1000)
                hour = timestamp // 3600000 * 3600000
                if hour not in timeline_data:
                    timeline_data[hour] = 0
                timeline_data[hour] += 1
                
                # Create a parsed vote object for consistency
                parsed_votes.append({
                    'option': vote_option,
                    'timestamp': timestamp
                })
                
            except Exception as e:
                print(f"Error processing encrypted vote: {e}")
                # Default for demo - distribute votes evenly
                vote_counts['inFavor'] += 1
        else:
            # Handle existing JSON vote format
            try:
                parsed_vote = vote if isinstance(vote, dict) else json.loads(vote)
                parsed_votes.append(parsed_vote)
                option = parsed_vote.get('option', 'inFavor')
                vote_counts[option] = vote_counts.get(option, 0) + 1
                
                # Update timeline data
                timestamp = parsed_vote.get('timestamp', int(time.time() * 1000))
                hour = timestamp // 3600000 * 3600000
                if hour not in timeline_data:
                    timeline_data[hour] = 0
                timeline_data[hour] += 1
            except Exception as e:
                print(f"Error parsing vote: {e}")
    
    # Generate TEE attestation proof
    tee_proof = generate_attestation_proof(vote_counts, proposal_id)
    
    # Prepare vote results
    vote_results = {
        "proposalId": proposal_id,
        "counts": vote_counts,
        "total": len(encrypted_votes),
        "tee_proof": tee_proof
    }
    
    # Get AI insights
    insights = secret_llm.analyze_voting_patterns({
        "proposal_id": proposal_id,
        "total_votes": len(encrypted_votes),
        "vote_distribution": vote_counts,
        "voting_timeline": timeline_data
    })
    
    # Store metadata using key-value storage
    from integrations.og_storage.storage_manager import StorageManager
    storage_manager = StorageManager()
    
    # Store vote results as metadata
    metadata_key = f"vote_results_{proposal_id}"
    storage_manager.store_metadata(metadata_key, {
        "results": vote_results,
        "timestamp": int(time.time() * 1000),
        "ai_insights": insights,
        "tee_proof": tee_proof
    })
    
    return {
        "results": vote_results,
        "ai_insights": insights,
        "storage_key": metadata_key,
        "tee_proof": tee_proof
    }

def process_auction_bids(encrypted_bids, project_id):
    """Process encrypted auction bids in the TEE"""
    # Similar structure to process_votes_in_tee but for bid processing
    # For hackathon demo, we'll just return a mock result
    
    bid_count = len(encrypted_bids)
    winning_bid = 100 * (bid_count + 1)  # Mock calculation
    
    # Generate attestation proof
    tee_proof = f"0x{hashlib.sha256(f'auction:{project_id}:{winning_bid}'.encode()).hexdigest()[:16]}"
    
    result = {
        "project_id": project_id,
        "bid_count": bid_count,
        "winning_bid": winning_bid,
        "tee_proof": tee_proof
    }
    
    return result
