// import React, { useState, useEffect } from 'react';
// import { getAddress } from '../utils/ViemConfig';
// import { type Address } from 'viem';

// // Define recommendation interface to fix TypeScript errors
// interface Recommendation {
//   title: string;
//   description: string;
//   riskLevel: number;
//   expectedReturn: number;
//   aiConfidence: number;
// }

// // Mock API function (create utils/api.ts with this function in a real implementation)
// const fetchAIRecommendations = async (address: Address): Promise<Recommendation[]> => {
//   console.log(`Fetching recommendations for address: ${address}`);
  
//   // Simulate API call with mock data
//   // In production, this would call the Nethermind AI service
//   return [
//     {
//       title: "Treasury Diversification Strategy",
//       description: "Allocate 20% of the DAO treasury to stable assets to reduce volatility during market downturns.",
//       riskLevel: 3,
//       expectedReturn: 7,
//       aiConfidence: 92
//     },
//     {
//       title: "DeFi Yield Optimization",
//       description: "Deploy 15% of funds into automated yield strategies across multiple networks for passive income.",
//       riskLevel: 6,
//       expectedReturn: 12,
//       aiConfidence: 85
//     },
//     {
//       title: "Strategic NFT Investment",
//       description: "Invest in blue-chip NFT collections with proven community engagement and long-term value.",
//       riskLevel: 8,
//       expectedReturn: 25,
//       aiConfidence: 73
//     }
//   ];
// };

// const NethermindAIAdvisor: React.FC = () => {
//   const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userAddress, setUserAddress] = useState<Address | undefined>(undefined);
  
//   // Get the user's address using ViemConfig instead of useWallet
//   useEffect(() => {
//     const initAddress = async () => {
//       const address = await getAddress();
//       setUserAddress(address);
//     };
    
//     initAddress();
//   }, []);
  
//   // Load recommendations when the address is available
//   useEffect(() => {
//     const loadRecommendations = async () => {
//       if (userAddress) {
//         setLoading(true);
//         try {
//           const data = await fetchAIRecommendations(userAddress);
//           setRecommendations(data);
//         } catch (error) {
//           console.error("Failed to load AI recommendations:", error);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
    
//     if (userAddress) {
//       loadRecommendations();
//     }
//   }, [userAddress]);
  
//   return (
//     <div className="ai-advisor-container">
//       <h2>Nethermind AI Recommendations</h2>
      
//       {!userAddress ? (
//         <p>Please connect your wallet to view AI recommendations</p>
//       ) : loading ? (
//         <p>Loading AI insights...</p>
//       ) : (
//         <div className="recommendations-list">
//           {recommendations.map((rec, index) => (
//             <div key={index} className="recommendation-card">
//               <h3>{rec.title}</h3>
//               <p>{rec.description}</p>
//               <div className="metrics">
//                 <span className="metric">Risk: {rec.riskLevel}/10</span>
//                 <span className="metric">Expected Return: {rec.expectedReturn}%</span>
//                 <span className="metric">Confidence: {rec.aiConfidence}%</span>
//               </div>
//               <button className="action-button">Implement</button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NethermindAIAdvisor;
