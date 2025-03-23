from web3 import Web3
import json
from tee.marlin_tee_integration.marlin_tee import process_votes_in_tee
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict, Any, Optional

# Create FastAPI app
app = FastAPI(title="AISecureFundDAO Vote Processing API")

# Set up CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Arbitrum Sepolia
w3 = Web3(Web3.HTTPProvider('https://sepolia-rollup.arbitrum.io/rpc'))

# Load contract ABIs
with open('./frontend/src/utils/PrivateVotingABI.json', 'r') as f:
    private_voting_abi = json.load(f)

# Contract addresses
PRIVATE_VOTING_ADDRESS = w3.to_checksum_address('0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb')

# Initialize contract
private_voting_contract = w3.eth.contract(address=PRIVATE_VOTING_ADDRESS, abi=private_voting_abi)

def fetch_proposal_votes(project_id):
    """Fetch encrypted votes for a specific proposal from the blockchain"""
    encrypted_votes = []
    
    try:
        # First check if the proposal exists
        proposal_details = private_voting_contract.functions.getProposalDetails(project_id).call()
        
        # Try to get all votes directly from the public array
        i = 0
        while True:
            try:
                # Access encryptedVotes mapping directly
                vote = private_voting_contract.functions.encryptedVotes(project_id, i).call()
                encrypted_votes.append(vote)
                i += 1
            except Exception as e:
                # Stop when out of bounds or error occurs
                break
                
        print(f"Retrieved {len(encrypted_votes)} votes for proposal {project_id}")
        return encrypted_votes
    except Exception as e:
        print(f"Error fetching votes for proposal {project_id}: {e}")
        return []

def process_chain_proposal(project_id):
    """Process votes for an on-chain proposal using MarlinTEE"""
    # Fetch encrypted votes from blockchain
    encrypted_votes = fetch_proposal_votes(project_id)
    
    if not encrypted_votes:
        print(f"No votes found for proposal {project_id}")
        return None
    
    # Process votes using MarlinTEE
    print(f"Processing {len(encrypted_votes)} votes in TEE...")
    results = process_votes_in_tee(encrypted_votes, project_id)
    
    return results

# Cache for proposal results to avoid reprocessing
results_cache: Dict[int, Any] = {}

@app.get("/")
async def root():
    return {"message": "AISecureFundDAO Vote Processing API"}

@app.get("/api/proposal/{project_id}/results")
async def get_proposal_results(project_id: int, refresh: Optional[bool] = False):
    """
    Get processed vote results for a specific proposal
    
    - **project_id**: ID of the proposal to process
    - **refresh**: Set to true to force reprocessing instead of using cache
    """
    # Check cache first unless refresh is requested
    if not refresh and project_id in results_cache:
        return results_cache[project_id]
    
    # Process the proposal votes
    results = process_chain_proposal(project_id)
    
    if not results:
        raise HTTPException(status_code=404, detail=f"No votes found for proposal {project_id}")
    
    # Update cache
    results_cache[project_id] = results
    
    return results

@app.get("/api/proposals/{project_id}/details")
async def get_proposal_details(project_id: int):
    """Get basic details about a proposal from the contract"""
    try:
        details = private_voting_contract.functions.getProposalDetails(project_id).call()
        
        # Format the response
        return {
            "projectId": project_id,
            "startTime": details[0],
            "endTime": details[1],
            "finalized": details[2],
            "approved": details[3],
            "aiInsightsHash": details[4].hex() if details[4] else None
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error fetching proposal {project_id}: {str(e)}")

# Run the API server
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='AISecureFundDAO Vote Processing API')
    parser.add_argument('--host', default='0.0.0.0', help='Host to run the API on')
    parser.add_argument('--port', default=8000, type=int, help='Port to run the API on')
    parser.add_argument('--process', default=None, type=int, help='Process a specific proposal ID and exit')
    
    args = parser.parse_args()
    
    if args.process is not None:
        # Just process a single proposal and exit
        results = process_chain_proposal(args.process)
        print(json.dumps(results, indent=4))
    else:
        # Run the API server
        print(f"Starting API server on {args.host}:{args.port}")
        uvicorn.run(app, host=args.host, port=args.port)
