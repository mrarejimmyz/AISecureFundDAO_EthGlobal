# test_nillion.py
from ai.nillion_integration.secret_llm import NillionSecretLLM
import json

def test_voting_analysis():
    try:
        # Initialize the NillionSecretLLM client
        nillion_llm = NillionSecretLLM()
        
        # Sample voting data for testing
        test_voting_data = {
            "proposal_id": "PROP-123",
            "total_votes": 150,
            "vote_distribution": {
                "inFavor": 85,
                "against": 45,
                "abstain": 20
            },
            "voting_timeline": {
                "1742450000000": 25,
                "1742453600000": 45,
                "1742457200000": 80
            }
        }
        
        # Test analyze_voting_patterns method
        print("Testing voting pattern analysis...")
        insights = nillion_llm.analyze_voting_patterns(test_voting_data)
        print("\nVoting Analysis Results:")
        print(insights)
        print("\n" + "-"*50 + "\n")
        
        return True
    except Exception as e:
        print(f"Error testing voting analysis: {e}")
        return False

def test_auction_strategies():
    try:
        # Initialize the NillionSecretLLM client
        nillion_llm = NillionSecretLLM()
        
        # Sample project data for testing
        test_project_data = {
            "project_id": "AI-FUND-001",
            "funding_target": 500000,
            "previous_bids": {
                "average": 15000,
                "highest": 35000,
                "lowest": 5000
            },
            "project_metrics": {
                "team_experience": "high",
                "technology_readiness": "medium",
                "market_potential": "very high"
            }
        }
        
        # Test suggest_auction_strategies method
        print("Testing auction strategy suggestions...")
        strategies = nillion_llm.suggest_auction_strategies(test_project_data)
        print("\nAuction Strategy Results:")
        print(strategies)
        
        return True
    except Exception as e:
        print(f"Error testing auction strategies: {e}")
        return False

if __name__ == "__main__":
    print("Starting Nillion SecretLLM tests...\n")
    
    # Run tests
    voting_test = test_voting_analysis()
    auction_test = test_auction_strategies()
    
    # Print summary
    print("\nTest Results Summary:")
    print(f"Voting Analysis Test: {'✅ PASSED' if voting_test else '❌ FAILED'}")
    print(f"Auction Strategies Test: {'✅ PASSED' if auction_test else '❌ FAILED'}")
