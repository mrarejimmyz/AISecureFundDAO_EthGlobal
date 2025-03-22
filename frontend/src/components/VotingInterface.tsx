import React, { useState } from 'react';
import styles from './VotingInterface.module.css';
import { 
  CheckCircle, 
  X, 
  Minus, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  CheckSquare 
} from 'phosphor-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'active' | 'ended';
}

const VotingInterface: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteOption, setVoteOption] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);

  // Example proposals
  const proposals: Proposal[] = [
    {
      id: 'PROP-001',
      title: 'Fund AI Research Project',
      description: 'Allocate 500 ETH to research privacy-preserving AI algorithms for decentralized voting systems.',
      deadline: '2025-04-15',
      status: 'active'
    },
    {
      id: 'PROP-002',
      title: 'Add New Governance Features',
      description: 'Implement quadratic voting and commit-reveal schemes to enhance the DAO governance system.',
      deadline: '2025-04-20',
      status: 'active'
    },
    {
      id: 'PROP-003',
      title: 'Partner with Ethereum Foundation',
      description: 'Establish a formal partnership with the Ethereum Foundation for research collaboration.',
      deadline: '2025-03-30',
      status: 'ended'
    }
  ];

  const handleVoteSubmit = () => {
    if (!voteOption || !selectedProposal) return;
    
    setIsSubmitting(true);
    setShowEncryption(true);
    
    // Simulate encryption and TEE processing
    setTimeout(() => {
      setIsSubmitting(false);
      setShowEncryption(false);
      setVoteOption(null);
      setSelectedProposal(null);
      // Show success message or handle the result
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? styles.statusActive : styles.statusEnded;
  };

  return (
    <div className={styles.votingContainer}>
      <div className={styles.votingHeader}>
        <h2 className={styles.votingTitle}>Private Voting</h2>
        <p className={styles.votingDescription}>
          Cast encrypted votes that are processed securely in Trusted Execution Environments (TEEs).
        </p>
      </div>
      
      <div className={styles.proposalsList}>
        <h3 className={styles.sectionTitle}>Active Proposals</h3>
        
        {proposals.map((proposal) => (
          <div 
            key={proposal.id}
            className={`${styles.proposalCard} ${selectedProposal === proposal.id ? styles.selectedProposal : ''}`}
            onClick={() => proposal.status === 'active' ? setSelectedProposal(proposal.id) : null}
          >
            <div className={styles.proposalHeader}>
              <div>
                <span className={styles.proposalId}>{proposal.id}</span>
                <span className={`${styles.statusBadge} ${getStatusColor(proposal.status)}`}>
                  {proposal.status === 'active' ? 'Active' : 'Ended'}
                </span>
              </div>
              <div className={styles.proposalDeadline}>
                {proposal.status === 'active' ? `Deadline: ${proposal.deadline}` : 'Voting ended'}
              </div>
            </div>
            
            <h4 className={styles.proposalTitle}>{proposal.title}</h4>
            <p className={styles.proposalDescription}>{proposal.description}</p>
            
            {selectedProposal === proposal.id && proposal.status === 'active' && (
              <div className={styles.voteOptions}>
                <h5 className={styles.voteTitle}>Cast Your Vote</h5>
                <div className={styles.voteButtons}>
                  <button 
                    className={`${styles.voteButton} ${voteOption === 'for' ? styles.selected : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVoteOption('for'); }}
                  >
                    <CheckCircle size={20} weight={voteOption === 'for' ? 'fill' : 'regular'} />
                    For
                  </button>
                  <button 
                    className={`${styles.voteButton} ${voteOption === 'against' ? styles.selected : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVoteOption('against'); }}
                  >
                    <X size={20} weight={voteOption === 'against' ? 'fill' : 'regular'} />
                    Against
                  </button>
                  <button 
                    className={`${styles.voteButton} ${voteOption === 'abstain' ? styles.selected : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVoteOption('abstain'); }}
                  >
                    <Minus size={20} weight={voteOption === 'abstain' ? 'fill' : 'regular'} />
                    Abstain
                  </button>
                </div>
                
                <button 
                  className={styles.submitButton}
                  onClick={handleVoteSubmit}
                  disabled={!voteOption || isSubmitting}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock size={18} />
                      Submit Encrypted Vote
                    </>
                  )}
                </button>

                {/* TEE Processing Indicator */}
                {showEncryption && (
                  <div className={styles.encryptionProcess}>
                    <div className={styles.encryptionSteps}>
                      <div className={`${styles.encryptionStep} ${styles.active}`}>
                        <Lock size={18} className={styles.encryptionIcon} />
                        <span>Encrypting Vote</span>
                        <CheckSquare size={14} className={styles.checkIcon} />
                      </div>
                      <ArrowRight size={14} className={styles.arrowIcon} />
                      <div className={`${styles.encryptionStep} ${styles.active}`}>
                        <ShieldCheck size={18} className={styles.encryptionIcon} />
                        <span>TEE Processing</span>
                      </div>
                      <ArrowRight size={14} className={styles.arrowIcon} />
                      <div className={styles.encryptionStep}>
                        <CheckCircle size={18} className={styles.encryptionIcon} />
                        <span>Vote Registered</span>
                      </div>
                    </div>
                    <div className={styles.teeIndicator}>
                      <ShieldCheck size={16} />
                      <span>Vote being processed in Trusted Execution Environment</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotingInterface;