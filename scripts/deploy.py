# scripts/deploy.py

def deploy_nethermind_integration():
    print("Configuring Nethermind Integration...")
    # Setup environment variables
    os.environ["NETHERMIND_API_KEY"] = config["nethermind"]["api_key"]
    os.environ["NETHERMIND_ENDPOINT"] = config["nethermind"]["endpoint"]
    
    # Initialize components
    from integrations.nethermind.agentic_ai import NethermindAgent
    agent = NethermindAgent()
    
    print("Testing Nethermind connection...")
    # Simple test to verify connection
    test_result = agent.agent_framework.test_connection()
    if test_result:
        print("✅ Nethermind integration successful")
    else:
        print("❌ Nethermind integration failed")
        
# Add to main deployment flow
def main():
    deploy_contracts()
    setup_tee_environment()
    deploy_nethermind_integration()
