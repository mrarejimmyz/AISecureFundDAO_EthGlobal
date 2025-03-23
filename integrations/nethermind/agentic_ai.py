# integrations/nethermind/agentic_ai.py
from crewai import Agent, Task, Crew, Process
from langchain_community.llms import LlamaCpp

class AgenticAI:
    def __init__(self):
        # Use local Llama model - no API key needed
        self.llm = LlamaCpp(
            model_path="models/llama-2-7b-chat.Q4_0.gguf",  # Download this file separately
            temperature=0.7,
            max_tokens=2000,
            top_p=1,
            verbose=False,
        )
        self.agents = self._setup_agents()
    
    def _setup_agents(self):
        # Define specialized agents
        proposal_analyzer = Agent(
            role="Proposal Analyzer",
            goal="Analyze DAO proposals for risks and benefits",
            backstory="You are an expert in risk assessment for DAOs",
            llm=self.llm,
            verbose=True
        )
        
        strategy_advisor = Agent(
            role="Strategy Advisor",
            goal="Suggest optimal voting strategies",
            backstory="You optimize governance decisions based on data",
            llm=self.llm,
            verbose=True
        )
        
        return {
            "analyzer": proposal_analyzer,
            "advisor": strategy_advisor
        }
    
    def analyze_proposal(self, proposal_text):
        # Create task for proposal analysis
        analysis_task = Task(
            description=f"Analyze this DAO proposal and assess potential risks, benefits, and alignment with DAO objectives: {proposal_text}",
            agent=self.agents["analyzer"]
        )
        
        # Create a crew with just this agent/task
        crew = Crew(
            agents=[self.agents["analyzer"]],
            tasks=[analysis_task],
            process=Process.sequential
        )
        
        # Run the analysis
        result = crew.kickoff()
        return result
    
    def optimize_voting(self, voting_data):
        # Create task for voting optimization
        optimization_task = Task(
            description=f"Based on this voting data, recommend optimal voting strategies: {voting_data}",
            agent=self.agents["advisor"]
        )
        
        # Create a crew with just this agent/task
        crew = Crew(
            agents=[self.agents["advisor"]],
            tasks=[optimization_task],
            process=Process.sequential
        )
        
        # Run the optimization
        result = crew.kickoff()
        return result
    
    def run(self, query):
        # Select the appropriate agent based on the query
        if "proposal" in query.lower() or "analyze" in query.lower():
            return self.analyze_proposal(query)
        elif "voting" in query.lower() or "strategy" in query.lower():
            return self.optimize_voting(query)
        else:
            # Default to the analyzer for general queries
            return self.analyze_proposal(query)
