import React, { useState, useEffect } from 'react';
import styles from './VotingInterface.module.css';
import { 
  CheckCircle, 
  X, 
  Minus, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  CheckSquare,
  Wallet
} from 'phosphor-react';
import { publicClient, walletClient, address } from '../utils/ViemConfig';
import PrivateVotingABI from '../utils/PrivateVotingABI.json';
import { parseEther, encodeAbiParameters, Account } from 'viem';

// Simplified homomorphic encryption implementation
const HomomorphicEncryption = {
  // Public key for encryption (in production, this would be fetched from the contract)
  publicKey: { n: 7919, g: 3613 },
  
  encrypt: function(value: number, randomFactor = Math.floor(Math.random() * 1000) + 1) {
    const { n, g } = this.publicKey;
    const nSquared = n * n;
    const gm = Math.pow(g, value) % nSquared;
    const rn = Math.pow(randomFactor, n) % nSquared;
    return (gm * rn) % nSquared;
  }
};

interface Proposal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'active' | 'ended';
  projectId: bigint;
}

const VotingInterface: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteOption, setVoteOption] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>('0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Example proposals - in production, these would be fetched from the blockchain
  const proposals: Proposal[] = [
    {
      id: 'PROP-001',
      title: 'Fund AI Research Project',
      description: 'Allocate 500 ETH to research privacy-preserving AI algorithms for decentralized voting systems.',
      deadline: '2025-04-15',
      status: 'active',
      projectId: BigInt(1)
    },
    {
      id: 'PROP-002',
      title: 'Add New Governance Features',
      description: 'Implement quadratic voting and commit-reveal schemes to enhance the DAO governance system.',
      deadline: '2025-04-20',
      status: 'active',
      projectId: BigInt(2)
    },
    {
      id: 'PROP-003',
      title: 'Partner with Ethereum Foundation',
      description: 'Establish a formal partnership with the Ethereum Foundation for research collaboration.',
      deadline: '2025-03-30',
      status: 'ended',
      projectId: BigInt(3)
    }
  ];

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const userAddress = await address();
        setWalletConnected(!!userAddress);
      } catch (error) {
        console.error("Error checking wallet:", error);
        setWalletConnected(false);
      }
    };
    
    checkWallet();
  }, []);

  // Create a new proposal
  const handleCreateProposal = async (projectId: bigint, durationInSeconds: bigint) => {
    if (!walletConnected) {
      setErrorMessage("Please connect your wallet first");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const userAddress = await address();
      
      const { request } = await publicClient.simulateContract({
        address: contractAddress as `0x${string}`,
        abi: PrivateVotingABI,
        functionName: 'createProposal',
        args: [projectId, durationInSeconds],
        account: userAddress as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash);
      
      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      setIsSubmitting(false);
      // Success notification would go here
    } catch (error) {
      console.error('Error creating proposal:', error);
      setErrorMessage("Failed to create proposal. See console for details.");
      setIsSubmitting(false);
    }
  };

  // Submit vote to the blockchain
  const handleVoteSubmit = async () => {
    if (!voteOption || !selectedProposal || !walletConnected) {
      setErrorMessage("Please select a vote option and ensure your wallet is connected");
      return;
    }
    
    // Find the selected proposal
    const proposal = proposals.find(p => p.id === selectedProposal);
    if (!proposal) return;
    
    setIsSubmitting(true);
    setShowEncryption(true);
    setErrorMessage(null);
    
    try {
      // Convert vote option to numeric value for encryption
      let voteValue: number;
      switch (voteOption) {
        case 'for': voteValue = 1; break;
        case 'against': voteValue = 2; break;
        case 'abstain': voteValue = 3; break;
        default: voteValue = 0;
      }
      
      // Encrypt the vote
      const encryptedVote = `0x${HomomorphicEncryption.encrypt(voteValue).toString(16)}`;
      
      // Prepare vote data for blockchain
      const userAddress = await address();
      
      // Call the contract
      const { request } = await publicClient.simulateContract({
        address: contractAddress as `0x${string}`,
        abi: PrivateVotingABI,
        functionName: 'castVote',
        args: [proposal.projectId, encryptedVote as `0x${string}`],
        account: userAddress as `0x${string}`
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash);
      
      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Simulate TEE processing (this would actually happen on-chain)
      setTimeout(() => {
        setIsSubmitting(false);
        setShowEncryption(false);
        setVoteOption(null);
        setSelectedProposal(null);
        // Show success message
      }, 2000);
    } catch (error) {
      console.error("Error submitting vote:", error);
      setErrorMessage("Failed to submit vote. See console for details.");
      setIsSubmitting(false);
      setShowEncryption(false);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      // Request accounts access
      const userAddress = await address();
      if (userAddress) {
        setWalletConnected(true);
      } else {
        setErrorMessage("Could not connect to wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrorMessage("Failed to connect wallet");
    }
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
        
        {!walletConnected && (
          <button 
            className={styles.connectWalletButton}
            onClick={connectWallet}
          >
            <Wallet size={18} />
            Connect Wallet
          </button>
        )}
        
        {walletConnected && (
          <div className={styles.walletConnected}>
            <ShieldCheck size={18} />
            Wallet Connected
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}
      
      {txHash && (
        <div className={styles.transactionInfo}>
          <p>Transaction submitted: <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</a></p>
        </div>
      )}
      
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
                    disabled={!walletConnected || isSubmitting}
                  >
                    <CheckCircle size={20} weight={voteOption === 'for' ? 'fill' : 'regular'} />
                    For
                  </button>
                  <button 
                    className={`${styles.voteButton} ${voteOption === 'against' ? styles.selected : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVoteOption('against'); }}
                    disabled={!walletConnected || isSubmitting}
                  >
                    <X size={20} weight={voteOption === 'against' ? 'fill' : 'regular'} />
                    Against
                  </button>
                  <button 
                    className={`${styles.voteButton} ${voteOption === 'abstain' ? styles.selected : ''}`}
                    onClick={(e) => { e.stopPropagation(); setVoteOption('abstain'); }}
                    disabled={!walletConnected || isSubmitting}
                  >
                    <Minus size={20} weight={voteOption === 'abstain' ? 'fill' : 'regular'} />
                    Abstain
                  </button>
                </div>
                
                <button 
                  className={styles.submitButton}
                  onClick={handleVoteSubmit}
                  disabled={!voteOption || isSubmitting || !walletConnected}
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
                    
                    <div className={styles.blockchainInfo}>
                      <p>Contract: {contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}</p>
                      {txHash && (
                        <p>Transaction: {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}</p>
                      )}
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
