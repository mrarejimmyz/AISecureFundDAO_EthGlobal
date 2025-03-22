import React, { useState, useEffect } from 'react';
import { 
  LockKey, 
  ShieldCheck, 
  Eye, 
  EyeSlash, 
  Database, 
  ArrowsClockwise, 
  CheckCircle, 
  ArrowRight, 
  Question,
  Brain,
  Code,
  PresentationChart,
  Warning
} from 'phosphor-react';
import styles from './PrivacyVisualization.module.css';

const PrivacyVisualization: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'vote' | 'auction' | 'ai'>('overview');
  const [animateFlow, setAnimateFlow] = useState(true);
  const [showTooltip, setShowTooltip] = useState('');

  // Restart animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateFlow(false);
      setTimeout(() => setAnimateFlow(true), 100);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSectionClick = (section: 'overview' | 'vote' | 'auction' | 'ai') => {
    setActiveSection(section);
  };

  const handleInfoClick = (tooltip: string) => {
    if (showTooltip === tooltip) {
      setShowTooltip('');
    } else {
      setShowTooltip(tooltip);
    }
  };

  const renderOverview = () => {
    return (
      <div className={styles.overviewSection}>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <LockKey size={24} weight="fill" />
            </div>
            <h3 className={styles.cardTitle}>Privacy Preservation</h3>
            <p className={styles.cardDescription}>
              AISecureFundDAO ensures all sensitive voting and bidding data remains confidential 
              through encryption and secure processing in Trusted Execution Environments.
            </p>
          </div>
          
          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <ShieldCheck size={24} weight="fill" />
            </div>
            <h3 className={styles.cardTitle}>Tamper-Proof Execution</h3>
            <p className={styles.cardDescription}>
              TEEs create an isolated and secure computing environment that guarantees 
              execution integrity even if the host system is compromised.
            </p>
          </div>
          
          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <Brain size={24} weight="fill" />
            </div>
            <h3 className={styles.cardTitle}>AI-Enhanced Analysis</h3>
            <p className={styles.cardDescription}>
              Machine learning models analyze voting patterns and funding allocations 
              while preserving privacy, generating insights without exposing sensitive data.
            </p>
          </div>
          
          <div className={styles.overviewCard}>
            <div className={styles.cardIcon}>
              <Code size={24} weight="fill" />
            </div>
            <h3 className={styles.cardTitle}>Verifiable Results</h3>
            <p className={styles.cardDescription}>
              All computations performed in TEEs generate cryptographic attestations that 
              allow verification of results without revealing the underlying data.
            </p>
          </div>
        </div>
        
        <div className={styles.teeArchitecture}>
          <h3 className={styles.architectureTitle}>
            TEE Network Architecture
          </h3>
          
          <div className={styles.architectureDiagram}>
            <div className={styles.diagramNode} data-node="user">
              <div className={styles.nodeIcon}><Eye size={20} /></div>
              <span className={styles.nodeLabel}>Users</span>
            </div>
            
            <div className={`${styles.diagramArrow} ${animateFlow ? styles.animateArrow : ''}`}>
              <div className={styles.dataPacket}>
                <LockKey size={12} />
              </div>
            </div>
            
            <div className={styles.diagramNode} data-node="blockchain">
              <div className={styles.nodeIcon}><Database size={20} /></div>
              <span className={styles.nodeLabel}>Blockchain</span>
            </div>
            
            <div className={`${styles.diagramArrow} ${animateFlow ? styles.animateArrow : ''}`}>
              <div className={styles.dataPacket}>
                <LockKey size={12} />
              </div>
            </div>
            
            <div className={styles.diagramNode} data-node="tee">
              <div className={styles.nodeIcon}><ShieldCheck size={20} /></div>
              <span className={styles.nodeLabel}>TEE Network</span>
              <button 
                className={styles.infoButton}
                onClick={() => handleInfoClick('tee')}
              >
                <Question size={14} />
              </button>
              
              {showTooltip === 'tee' && (
                <div className={styles.tooltipBox}>
                  <h4>Trusted Execution Environment</h4>
                  <p>
                    A secure area within a processor that guarantees code and data loaded inside 
                    is protected with respect to confidentiality and integrity. Our implementation 
                    uses Marlin TEEs for secure multi-party computation.
                  </p>
                </div>
              )}
            </div>
            
            <div className={`${styles.diagramArrow} ${animateFlow ? styles.animateArrow : ''}`}>
              <div className={styles.dataPacket}>
                <CheckCircle size={12} />
              </div>
            </div>
            
            <div className={styles.diagramNode} data-node="result">
              <div className={styles.nodeIcon}><PresentationChart size={20} /></div>
              <span className={styles.nodeLabel}>Verified Results</span>
            </div>
          </div>
        </div>
        
        <div className={styles.sponsorSection}>
          <h3 className={styles.sponsorTitle}>Technology Providers</h3>
          <div className={styles.sponsorGrid}>
            <div className={styles.sponsorItem}>
              <span className={styles.sponsorName}>Marlin TEEs</span>
              <span className={styles.sponsorRole}>Secure Computation</span>
            </div>
            <div className={styles.sponsorItem}>
              <span className={styles.sponsorName}>Nethermind</span>
              <span className={styles.sponsorRole}>Agentic AI</span>
            </div>
            <div className={styles.sponsorItem}>
              <span className={styles.sponsorName}>Nillion</span>
              <span className={styles.sponsorRole}>Private AI</span>
            </div>
            <div className={styles.sponsorItem}>
              <span className={styles.sponsorName}>t1 Protocol</span>
              <span className={styles.sponsorRole}>Real-time Proving</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVotePrivacy = () => {
    return (
      <div className={styles.flowSection}>
        <h3 className={styles.flowTitle}>
          Privacy-Preserving Voting Flow
        </h3>
        
        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <LockKey size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>Vote Encryption</h4>
              <p className={styles.flowStepDescription}>
                Each vote is encrypted client-side with a unique key that only the 
                TEE can decrypt. The vote's content remains private even from the DAO infrastructure.
              </p>
            </div>
            <button 
              className={styles.infoButton}
              onClick={() => handleInfoClick('vote-encrypt')}
            >
              <Question size={14} />
            </button>
            
            {showTooltip === 'vote-encrypt' && (
              <div className={styles.tooltipBox}>
                <h4>Homomorphic Encryption</h4>
                <p>
                  We use partial homomorphic encryption that allows counting votes 
                  without decrypting individual ballots, preserving voter privacy 
                  throughout the entire process.
                </p>
              </div>
            )}
          </div>
          
          <div className={styles.flowArrow}>
            <ArrowRight size={16} />
          </div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <Database size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>Secure Storage</h4>
              <p className={styles.flowStepDescription}>
                Encrypted votes are stored on-chain as opaque data blobs. 
                No one, including DAO administrators, can see the vote contents.
              </p>
            </div>
          </div>
          
          <div className={styles.flowArrow}>
            <ArrowRight size={16} />
          </div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <ShieldCheck size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>TEE Processing</h4>
              <p className={styles.flowStepDescription}>
                After the voting period, encrypted votes are processed inside TEEs. 
                The code execution and memory are isolated from the rest of the system.
              </p>
            </div>
            <button 
              className={styles.infoButton}
              onClick={() => handleInfoClick('vote-tee')}
            >
              <Question size={14} />
            </button>
            
            {showTooltip === 'vote-tee' && (
              <div className={styles.tooltipBox}>
                <h4>Multi-Party TEE Network</h4>
                <p>
                  Votes are processed across multiple TEE nodes in different 
                  jurisdictions. This ensures no single entity can tamper with
                  the results, even if they control one node.
                </p>
              </div>
            )}
          </div>
          
          <div className={styles.flowArrow}>
            <ArrowRight size={16} />
          </div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>Verified Results</h4>
              <p className={styles.flowStepDescription}>
                Result totals are published with cryptographic proofs that verify 
                correct computation without revealing individual votes.
              </p>
            </div>
          </div>
        </div>
        
        <div className={styles.privacyBenefits}>
          <div className={styles.benefitCard}>
            <CheckCircle size={18} weight="fill" className={styles.benefitIcon} />
            <span className={styles.benefitText}>
              Prevents vote buying and coercion
            </span>
          </div>
          <div className={styles.benefitCard}>
            <CheckCircle size={18} weight="fill" className={styles.benefitIcon} />
            <span className={styles.benefitText}>
              Eliminates strategic voting based on others' choices
            </span>
          </div>
          <div className={styles.benefitCard}>
            <CheckCircle size={18} weight="fill" className={styles.benefitIcon} />
            <span className={styles.benefitText}>
              Protects minority viewpoints from intimidation
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderAuctionPrivacy = () => {
    return (
      <div className={styles.flowSection}>
        <h3 className={styles.flowTitle}>
          Sealed-Bid Auction Privacy
        </h3>
        
        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <LockKey size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>Bid Encryption</h4>
              <p className={styles.flowStepDescription}>
                Each bid amount is encrypted with TEE public keys before submission,
                ensuring no one can see the bid amounts during the auction period.
              </p>
            </div>
          </div>
          
          <div className={styles.flowArrow}>
            <ArrowRight size={16} />
          </div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <EyeSlash size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>Commitment Mechanism</h4>
              <p className={styles.flowStepDescription}>
                Bidders commit funds in escrow without revealing their bid amount,
                preventing fake bids while maintaining privacy.
              </p>
            </div>
            <button 
              className={styles.infoButton}
              onClick={() => handleInfoClick('auction-commit')}
            >
              <Question size={14} />
            </button>
            
            {showTooltip === 'auction-commit' && (
              <div className={styles.tooltipBox}>
                <h4>Zero-Knowledge Commitments</h4>
                <p>
                  We use zero-knowledge proofs to verify that bidders have 
                  committed sufficient funds without revealing the exact amount 
                  of their bids, ensuring bid privacy while preventing underfunded bids.
                </p>
              </div>
            )}
          </div>
          
          <div className={styles.flowArrow}>
            <ArrowRight size={16} />
          </div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <ShieldCheck size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>TEE Resolution</h4>
              <p className={styles.flowStepDescription}>
                After the bidding period ends, TEEs decrypt and process all bids
                to determine the winner, without revealing losing bid amounts.
              </p>
            </div>
          </div>
          
          <div className={styles.flowArrow}>
            <ArrowRight size={16} />
          </div>
          
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className={styles.flowContent}>
              <h4 className={styles.flowStepTitle}>Selective Disclosure</h4>
              <p className={styles.flowStepDescription}>
                Only the winning bid amount is revealed, while losing bids 
                remain private, with excess funds automatically returned.
              </p>
            </div>
            <button 
              className={styles.infoButton}
              onClick={() => handleInfoClick('auction-disclosure')}
            >
              <Question size={14} />
            </button>
            
            {showTooltip === 'auction-disclosure' && (
              <div className={styles.tooltipBox}>
                <h4>Privacy-Preserving Refunds</h4>
                <p>
                  Losing bidders receive refunds through a privacy-preserving 
                  mechanism that doesn't reveal their bid amounts, maintaining 
                  confidentiality even after the auction concludes.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.privacyBenefits}>
          <div className={styles.benefitCard}>
            <CheckCircle size={18} weight="fill" className={styles.benefitIcon} />
            <span className={styles.benefitText}>
              Prevents front-running and bid manipulation
            </span>
          </div>
          <div className={styles.benefitCard}>
            <CheckCircle size={18} weight="fill" className={styles.benefitIcon} />
            <span className={styles.benefitText}>
              Eliminates price anchoring effects from public bids
            </span>
          </div>
          <div className={styles.benefitCard}>
            <CheckCircle size={18} weight="fill" className={styles.benefitIcon} />
            <span className={styles.benefitText}>
              Protects strategic bidding information from competitors
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderAiPrivacy = () => {
    return (
      <div className={styles.flowSection}>
        <h3 className={styles.flowTitle}>
          Privacy-Preserving AI Analytics
        </h3>
        
        <div className={styles.aiContainer}>
          <div className={styles.aiVisual}>
            <div className={styles.aiNode}>
              <div className={styles.aiNodeIcon}>
                <Database size={24} />
              </div>
              <span className={styles.aiNodeLabel}>Encrypted Data</span>
            </div>

            <div className={styles.aiProcessor}>
              <div className={styles.processorRing}></div>
              <div className={styles.processorCore}>
                <Brain size={32} weight="fill" />
              </div>
              <div className={`${styles.processorRing} ${styles.ringOuter}`}></div>
              <div className={styles.processorLabel}>
                <ShieldCheck size={16} />
                <span>TEE-Protected AI</span>
              </div>
            </div>
            
            <div className={styles.aiNode}>
              <div className={styles.aiNodeIcon}>
                <PresentationChart size={24} />
              </div>
              <span className={styles.aiNodeLabel}>Insights & Analysis</span>
            </div>
          </div>
          
          <div className={styles.aiFeatures}>
            <div className={styles.aiFeatureCard}>
              <div className={styles.aiFeatureIcon}>
                <LockKey size={20} weight="fill" />
              </div>
              <div className={styles.aiFeatureContent}>
                <h4 className={styles.aiFeatureTitle}>Private AI Computation</h4>
                <p className={styles.aiFeatureDescription}>
                  Machine learning models run inside TEEs, ensuring that raw data is never 
                  exposed. The AI sees encrypted data but produces valuable insights.
                </p>
              </div>
            </div>
            
            <div className={styles.aiFeatureCard}>
              <div className={styles.aiFeatureIcon}>
                <Brain size={20} weight="fill" />
              </div>
              <div className={styles.aiFeatureContent}>
                <h4 className={styles.aiFeatureTitle}>Differential Privacy</h4>
                <p className={styles.aiFeatureDescription}>
                  We add carefully calibrated noise to AI inputs and outputs to provide 
                  mathematical privacy guarantees, preventing reconstruction of individual data.
                </p>
                <button 
                  className={styles.infoButton}
                  onClick={() => handleInfoClick('differential-privacy')}
                >
                  <Question size={14} />
                </button>
                
                {showTooltip === 'differential-privacy' && (
                  <div className={styles.tooltipBox}>
                    <h4>ε-Differential Privacy</h4>
                    <p>
                      Our implementation uses ε=2.0 differential privacy, striking a balance 
                      between useful insights and strong privacy guarantees. This means 
                      individual votes or bids remain indistinguishable within defined bounds.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.aiFeatureCard}>
              <div className={styles.aiFeatureIcon}>
                <ArrowsClockwise size={20} weight="fill" />
              </div>
              <div className={styles.aiFeatureContent}>
                <h4 className={styles.aiFeatureTitle}>Federated Learning</h4>
                <p className={styles.aiFeatureDescription}>
                  Our AI models learn from decentralized data sources without centralizing 
                  sensitive information, improving with each governance cycle.
                </p>
              </div>
            </div>
            
            <div className={styles.aiFeatureCard}>
              <div className={styles.aiFeatureIcon}>
                <CheckCircle size={20} weight="fill" />
              </div>
              <div className={styles.aiFeatureContent}>
                <h4 className={styles.aiFeatureTitle}>Auditable AI</h4>
                <p className={styles.aiFeatureDescription}>
                  All AI-generated insights include attestations about the data and models 
                  used, providing transparency without compromising raw data privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.securityNote}>
          <Warning size={20} className={styles.warningIcon} />
          <div className={styles.securityNoteContent}>
            <h4 className={styles.securityNoteTitle}>
              Continual Security Improvements
            </h4>
            <p className={styles.securityNoteText}>
              Our privacy-preserving technologies undergo regular security audits and improvements.
              While no system provides absolute privacy guarantees, we implement multiple layers of 
              protection to minimize risks to user data confidentiality.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.privacyContainer}>
      <div className={styles.privacyHeader}>
        <h2 className={styles.privacyTitle}>Privacy & Security Architecture</h2>
        <p className={styles.privacyDescription}>
          Explore how AISecureFundDAO uses Trusted Execution Environments (TEEs) and advanced
          cryptography to ensure privacy and security throughout the governance process.
        </p>
      </div>
      
      <div className={styles.privacyTabs}>
        <button
          className={`${styles.privacyTab} ${activeSection === 'overview' ? styles.activeTab : ''}`}
          onClick={() => handleSectionClick('overview')}
        >
          <ShieldCheck size={18} />
          Overview
        </button>
        <button
          className={`${styles.privacyTab} ${activeSection === 'vote' ? styles.activeTab : ''}`}
          onClick={() => handleSectionClick('vote')}
        >
          <CheckCircle size={18} />
          Voting Privacy
        </button>
        <button
          className={`${styles.privacyTab} ${activeSection === 'auction' ? styles.activeTab : ''}`}
          onClick={() => handleSectionClick('auction')}
        >
          <LockKey size={18} />
          Auction Privacy
        </button>
        <button
          className={`${styles.privacyTab} ${activeSection === 'ai' ? styles.activeTab : ''}`}
          onClick={() => handleSectionClick('ai')}
        >
          <Brain size={18} />
          AI Privacy
        </button>
      </div>
      
      <div className={styles.privacyContent}>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'vote' && renderVotePrivacy()}
        {activeSection === 'auction' && renderAuctionPrivacy()}
        {activeSection === 'ai' && renderAiPrivacy()}
      </div>
    </div>
  );
};

export default PrivacyVisualization;