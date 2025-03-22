import React, { useState, useEffect } from 'react';
import styles from './VotingInterface.module.css';
import { 
  CheckCircle, X, Minus, Lock, ShieldCheck, 
  ArrowRight, CheckSquare, Wallet
} from 'phosphor-react';
import { publicClient, createWallet, getAddress } from '../utils/ViemConfig';
import PrivateVotingABI from '../utils/PrivateVotingABI.json';

// @ts-ignore
import { simulateContract, writeContract, waitForTransactionReceipt } from 'viem';

// Simplified homomorphic encryption
const HomomorphicEncryption = {
  publicKey: { n: 7919, g: 3613 },
  encrypt: function(value: number, randomFactor = Math.floor(Math.random() * 1000) + 1) {
    const { n, g } = this.publicKey;
    const nSquared = n * n;
    const gm = Math.pow(g, value) % nSquared;
    const rn = Math.pow(randomFactor, n) % nSquared;
    return (gm * rn) % nSquared;
  }
};

// Contract address constant
const CONTRACT_ADDRESS = '0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb';

const VotingInterface: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteOption, setVoteOption] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mock proposals (would be fetched from blockchain in production)
  const proposals = [
    {
      id: 'PROP-001',
      title: 'Fund AI Research Project',
      description: 'Allocate 500 ETH to research privacy-preserving AI algorithms.',
      deadline: '2025-04-15',
      status: 'active' as const,
      projectId: BigInt(1)
    },
    {
      id: 'PROP-002',
      title: 'Add New Governance Features',
      description: 'Implement quadratic voting and commit-reveal schemes.',
      deadline: '2025-04-20',
      status: 'active' as const,
      projectId: BigInt(2)
    },
    {
      id: 'PROP-003',
      title: 'Partner with Ethereum Foundation',
      description: 'Establish a formal partnership for research collaboration.',
      deadline: '2025-03-30',
      status: 'ended' as const,
      projectId: BigInt(3)
    }
  ];

  // Check wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const userAddress = await getAddress();
        setWalletConnected(!!userAddress);
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };
    checkWallet();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      const userAddress = await getAddress();
      setWalletConnected(!!userAddress);
      if (!userAddress) setErrorMessage("Could not connect to wallet");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrorMessage("Failed to connect wallet");
    }
  };

  // Submit vote to blockchain
  const handleVoteSubmit = async () => {
    if (!voteOption || !selectedProposal || !walletConnected) {
      setErrorMessage("Please select a vote option and ensure your wallet is connected");
      return;
    }
    
    const proposal = proposals.find(p => p.id === selectedProposal);
    if (!proposal) return;
    
    setIsSubmitting(true);
    setShowEncryption(true);
    setErrorMessage(null);
    
    try {
      const voteValues = { 'for': 1, 'against': 2, 'abstain': 3 };
      const voteValue = voteValues[voteOption];
      
      const encryptedVote = `0x${HomomorphicEncryption.encrypt(voteValue).toString(16)}`;
      
      const userAddress = await getAddress();
      
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PrivateVotingABI,
        functionName: 'castVote',
        args: [proposal.projectId, encryptedVote as `0x${string}`],
        account: userAddress as `0x${string}`
      });
  
      const wallet = await createWallet();
      if (!wallet) throw new Error("Wallet not connected");
      
      // Use wallet.writeContract instead of writeContract
      const hash = await wallet.writeContract(request);
      setTxHash(hash);
      
      // Use publicClient.waitForTransactionReceipt instead of waitForTransactionReceipt
      await publicClient.waitForTransactionReceipt({ hash });
      
      setTimeout(() => {
        setIsSubmitting(false);
        setShowEncryption(false);
        setVoteOption(null);
        setSelectedProposal(null);
      }, 2000);
    } catch (error) {
      console.error("Error submitting vote:", error);
      setErrorMessage("Failed to submit vote. See console for details.");
      setIsSubmitting(false);
      setShowEncryption(false);
    }
  };
  

  // Helper for status color
  const getStatusColor = (status: string) => 
    status === 'active' ? styles.statusActive : styles.statusEnded;

  return (
    <div className={styles.votingContainer}>
      <div className={styles.votingHeader}>
        <h2 className={styles.votingTitle}>Private Voting</h2>
        <p className={styles.votingDescription}>
          Cast encrypted votes processed securely in Trusted Execution Environments.
        </p>
        
        {!walletConnected ? (
          <button 
            className={styles.connectWalletButton}
            onClick={connectWallet}
          >
            <Wallet size={18} />
            Connect Wallet
          </button>
        ) : (
          <div className={styles.walletConnected}>
            <ShieldCheck size={18} />
            Wallet Connected
          </div>
        )}
      </div>
      
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      
      {txHash && (
        <div className={styles.transactionInfo}>
          <p>Transaction: 
            <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
            </a>
          </p>
        </div>
      )}
      
      <div className={styles.proposalsList}>
        <h3 className={styles.sectionTitle}>Proposals</h3>
        
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
                  {isSubmitting ? 'Processing...' : (
                    <>
                      <Lock size={18} />
                      Submit Encrypted Vote
                    </>
                  )}
                </button>

                {showEncryption && (
                  <div className={styles.encryptionProcess}>
                    <div className={styles.encryptionSteps}>
                      <div className={`${styles.encryptionStep} ${styles.active}`}>
                        <Lock size={18} />
                        <span>Encrypting</span>
                        <CheckSquare size={14} />
                      </div>
                      <ArrowRight size={14} />
                      <div className={`${styles.encryptionStep} ${styles.active}`}>
                        <ShieldCheck size={18} />
                        <span>TEE Processing</span>
                      </div>
                      <ArrowRight size={14} />
                      <div className={styles.encryptionStep}>
                        <CheckCircle size={18} />
                        <span>Vote Registered</span>
                      </div>
                    </div>
                    
                    {txHash && (
                      <div className={styles.blockchainInfo}>
                        <p>Contract: {CONTRACT_ADDRESS.substring(0, 6)}...{CONTRACT_ADDRESS.substring(CONTRACT_ADDRESS.length - 4)}</p>
                        <p>TX: {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}</p>
                      </div>
                    )}
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
