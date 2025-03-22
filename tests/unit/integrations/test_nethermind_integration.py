# tests/unit/integrations/test_nethermind_integration.py

import unittest
from unittest.mock import patch, MagicMock
from integrations.nethermind.agentic_ai import NethermindAgent

class TestNethermindIntegration(unittest.TestCase):
    def setUp(self):
        self.agent = NethermindAgent()
        
    @patch('nethermind.ai.AgentFramework')
    def test_proposal_analysis(self, mock_framework):
        # Setup mock
        mock_framework.return_value.enhance_analysis.return_value = {
            "risk_assessment": "medium",
            "expected_impact": "positive",
            "confidence": 0.87
        }
        
        # Test
        test_proposal = {"id": "PROP-001", "title": "Treasury Diversification"}
        result = self.agent.analyze_proposals(test_proposal)
        
        # Assert
        self.assertEqual(result["risk_assessment"], "medium")
        self.assertEqual(result["confidence"], 0.87)
