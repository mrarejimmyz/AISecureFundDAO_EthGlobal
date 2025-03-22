// frontend/src/components/NethermindAIAdvisor.tsx

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { fetchAIRecommendations } from '../utils/api';

const NethermindAIAdvisor: React.FC = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();
  
  useEffect(() => {
    const loadRecommendations = async () => {
      if (address) {
        setLoading(true);
        try {
          const data = await fetchAIRecommendations(address);
          setRecommendations(data);
        } catch (error) {
          console.error("Failed to load AI recommendations:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadRecommendations();
  }, [address]);
  
  return (
    <div className="ai-advisor-container">
      <h2>Nethermind AI Recommendations</h2>
      {loading ? (
        <p>Loading AI insights...</p>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <div className="metrics">
                <span className="metric">Risk: {rec.riskLevel}/10</span>
                <span className="metric">Expected Return: {rec.expectedReturn}%</span>
                <span className="metric">Confidence: {rec.aiConfidence}%</span>
              </div>
              <button className="action-button">Implement</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NethermindAIAdvisor;
