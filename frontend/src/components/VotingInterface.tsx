import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styles from "./VotingInterface.module.css";
import {
  CheckCircle,
  X,
  Minus,
  Lock,
  ShieldCheck,
  ArrowRight,
  CheckSquare,
  Info,
  LockKey,
  CurrencyEth,
  Users,
  Calendar,
} from "phosphor-react";
import { useWallet } from "../context/WalletContext";
import PrivateVotingABI from "../utils/PrivateVotingABI.json";
import ProductRegistryABI from "../utils/ProductRegistryABI.json";

// Contract addresses - make sure these are correct
const PRIVATE_VOTING_ADDRESS = "0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb";
const PROJECT_REGISTRY_ADDRESS = "0x485641b60be6e9bd662a9cecb58d66874257aa25";

interface Project {
  id: string;
  name: string;
  proposer: string;
  fundingGoal: string;
  isActive: boolean;
  hasProposal?: boolean;
}

interface Proposal {
  id: string; // For display (e.g., PROP-001)
  projectId: string; // Actual projectId from the contract
  title: string;
  description: string;
  deadline: string;
  endTime: number;
  status: "active" | "ended";
  finalized: boolean;
  approved?: boolean;
  projectDetails?: Project; // Link to project details
}

const VotingInterface: React.FC = () => {
  const { isActive, provider, chainId } = useWallet();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [voteOption, setVoteOption] = useState<
    "for" | "against" | "abstain" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Fetch both projects and proposals
  useEffect(() => {
    if (!provider) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch projects
        const projectsData = await fetchProjects();

        // Step 2: Fetch proposals and update project status
        await fetchProposals(projectsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [provider, voteSuccess, createSuccess]);

  // Fetch projects from ProjectRegistry
  const fetchProjects = async () => {
    if (!provider) return [];

    try {
      console.log("Fetching projects from:", PROJECT_REGISTRY_ADDRESS);

      // Connect to the ProjectRegistry contract
      const projectContract = new ethers.Contract(
        PROJECT_REGISTRY_ADDRESS,
        ProductRegistryABI,
        provider
      );

      // Get the total count of projects
      const count = await projectContract.projectCount();
      console.log("Project count:", count.toString());

      // Array to store projects
      const projectsArray: Project[] = [];

      // Fetch each project
      for (let i = 1; i <= count; i++) {
        try {
          console.log(`Fetching project ${i}...`);
          const project = await projectContract.projects(i);
          console.log(`Project ${i} data:`, project);

          projectsArray.push({
            id: project.id.toString(),
            name: project.name,
            proposer: project.proposer,
            fundingGoal: ethers.formatEther(project.fundingGoal),
            isActive: project.isActive,
            hasProposal: false, // Default to false, will update after fetching proposals
          });
        } catch (error) {
          console.error(`Error fetching project ${i}:`, error);
        }
      }

      setProjects(projectsArray);
      console.log("Projects fetched successfully:", projectsArray);
      return projectsArray;
    } catch (err) {
      console.error("Error fetching projects:", err);
      throw err;
    }
  };

  // Fetch proposals from PrivateVoting contract
  const fetchProposals = async (projectsData: Project[]) => {
    if (!provider) return;

    try {
      console.log("Fetching proposals from:", PRIVATE_VOTING_ADDRESS);

      // Connect to the PrivateVoting contract
      const contract = new ethers.Contract(
        PRIVATE_VOTING_ADDRESS,
        PrivateVotingABI,
        provider
      );

      // Get ProposalCreated events
      const filter = contract.filters.ProposalCreated();
      const events = await contract.queryFilter(filter);
      console.log("Proposal events found:", events.length);

      // Current timestamp for checking if proposal is active
      const currentTime = Math.floor(Date.now() / 1000);

      // If no proposals are found, just keep the projects as they are
      if (events.length === 0) {
        console.log("No proposals found. Using only project data.");
        return;
      }

      const proposalPromises = events.map(async (event) => {
        try {
          // TypeScript fix: Type casting the event to access args
          const eventLog = event as ethers.EventLog;

          // Extract projectId from the event
          const projectId = eventLog.args[0].toString();
          console.log(`Processing proposal for project ${projectId}`);

          // Get proposal details
          const details = await contract.getProposalDetails(projectId);
          console.log("Proposal details:", details);

          // Safely handle the values from the contract
          let startTime = 0;
          let endTime = 0;
          let finalized = false;
          let approved = false;

          // Check if details is an array and has enough elements
          if (Array.isArray(details) && details.length >= 3) {
            // Handle different possible types for endTime
            if (details[1] !== undefined) {
              if (typeof details[1] === "number") {
                endTime = details[1];
              } else if (typeof details[1].toNumber === "function") {
                endTime = details[1].toNumber();
              } else if (typeof details[1] === "bigint") {
                endTime = Number(details[1]);
              } else if (typeof details[1] === "string") {
                endTime = parseInt(details[1]);
              }
            }

            finalized = !!details[2];
            if (details.length > 3) {
              approved = !!details[3];
            }
          }

          console.log(
            `Project ${projectId} - endTime: ${endTime}, finalized: ${finalized}, approved: ${approved}`
          );

          // Format the deadline
          const deadlineDate = new Date(endTime * 1000);
          const formattedDeadline = deadlineDate.toLocaleDateString();

          // Determine if the proposal is active
          const isActive = !finalized && endTime > currentTime;

          // Find the project details
          const projectDetails = projectsData.find((p) => p.id === projectId);

          // Mark this project as having a proposal
          if (projectDetails) {
            projectDetails.hasProposal = true;
          }

          const title = projectDetails
            ? projectDetails.name
            : `Project Proposal #${projectId}`;

          const description = projectDetails
            ? `Funding proposal for ${projectDetails.name} requesting ${projectDetails.fundingGoal} ETH.`
            : "This proposal is for funding a project on the AISecureFundDAO platform.";

          return {
            id: `PROP-${projectId.padStart(3, "0")}`,
            projectId: projectId,
            title: title,
            description: description,
            deadline: formattedDeadline,
            endTime: endTime,
            status: isActive ? "active" : "ended",
            finalized: finalized,
            approved: approved,
            projectDetails: projectDetails,
          } as Proposal;
        } catch (err) {
          console.error("Error processing proposal event:", err);
          return null;
        }
      });

      const fetchedProposals = (await Promise.all(proposalPromises)).filter(
        (proposal) => proposal !== null
      ) as Proposal[];
      console.log("Proposals fetched successfully:", fetchedProposals);

      // Update the global state with proposals
      setProposals(fetchedProposals);

      // Update projects state to reflect which ones have proposals
      setProjects([...projectsData]);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      throw err;
    }
  };

  // Create a voting proposal for a project
  const createVotingProposal = async (projectId: string) => {
    if (!provider || !isActive) {
      alert("Please connect your wallet first");
      return;
    }

    setCreatingProposal(projectId);
    setTxHash(null);

    try {
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(
        PRIVATE_VOTING_ADDRESS,
        PrivateVotingABI,
        signer
      );

      // Create a proposal with 7 days duration (in seconds)
      const duration = 7 * 24 * 60 * 60; // 7 days

      console.log(
        `Creating voting proposal for project ${projectId} with duration ${duration}...`
      );

      // Call the createProposal function
      const tx = await votingContract.createProposal(projectId, duration);
      console.log("Transaction sent:", tx.hash);

      // Set the transaction hash for display
      setTxHash(tx.hash);

      // Wait for the transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");

      // Update state to show success and trigger a refresh
      setCreateSuccess(true);

      // Reset after a delay
      setTimeout(() => {
        setCreateSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Error creating voting proposal:", err);
      alert(
        `Failed to create voting proposal: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setCreatingProposal(null);
    }
  };

  // Format time remaining until deadline
  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);

    return `${days}d ${hours}h remaining`;
  };

  // Helper function to get the transaction explorer URL based on chainId
  const getExplorerUrl = (txHash: string, chainId?: number) => {
    // Default to a generic blockscan explorer
    let baseUrl = "https://sepolia.arbiscan.io/tx/";

    if (chainId) {
      switch (chainId) {
        case 1: // Ethereum Mainnet
          baseUrl = "https://etherscan.io/tx/";
          break;
        case 5: // Goerli
          baseUrl = "https://goerli.etherscan.io/tx/";
          break;
        case 11155111: // Sepolia
          baseUrl = "https://sepolia.etherscan.io/tx/";
          break;
        case 42161: // Arbitrum One
          baseUrl = "https://arbiscan.io/tx/";
          break;
        case 421613: // Arbitrum Sepolia
          baseUrl = "https://sepolia.arbiscan.io/tx/";
          break;
        case 84531: // Base Goerli
          baseUrl = "https://goerli.basescan.org/tx/";
          break;
        // Add more networks as needed
      }
    }

    return baseUrl + txHash;
  };

  // Handle vote submission
  const handleVoteSubmit = async () => {
    if (!voteOption || !selectedProject || !isActive || !provider) return;

    // Find the proposal for the selected project
    const projectId = selectedProject;
    const proposal = proposals.find((p) => p.projectId === projectId);

    if (!proposal) {
      alert("No active proposal found for this project");
      return;
    }

    setIsSubmitting(true);
    setShowEncryption(true);
    setTxHash(null);

    try {
      // Create contract instance
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PRIVATE_VOTING_ADDRESS,
        PrivateVotingABI,
        signer
      );

      // Create an encrypted vote
      // In a real implementation, this would use TEE's public key for encryption
      // Here we're simulating it with a simple hash
      const voteValue =
        voteOption === "for" ? 1 : voteOption === "against" ? 2 : 0;
      const encryptedVote = ethers.keccak256(
        ethers.toUtf8Bytes(`${voteValue}-${Date.now()}`)
      );

      console.log("Submitting vote for project ID:", projectId);

      // Call the contract
      const tx = await contract.castVote(projectId, encryptedVote);
      console.log("Transaction sent:", tx.hash);

      // Set the transaction hash for display
      setTxHash(tx.hash);

      // Wait for transaction to be mined
      await tx.wait();
      console.log("Vote transaction confirmed");

      // Reset state
      setVoteOption(null);
      setSelectedProject(null);
      setVoteSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setVoteSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting vote:", error);

      // Show error to user
      alert(
        `Error submitting vote: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
      setShowEncryption(false);
    }
  };

  return (
    <div className={styles.votingContainer}>
      <div className={styles.votingHeader}>
        <h2 className={styles.votingTitle}>Project Voting</h2>
        <p className={styles.votingDescription}>
          View projects and cast encrypted votes. All votes are processed
          securely in Trusted Execution Environments (TEEs).
        </p>
      </div>

      {!isActive && (
        <div className={styles.walletWarning}>
          <Info size={24} />
          <p>Please connect your wallet to participate in voting</p>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading projects and proposals...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No projects found. Please check back later.</p>
        </div>
      ) : (
        <div className={styles.projectsList}>
          <h3 className={styles.sectionTitle}>Projects Available for Voting</h3>

          {projects.map((project) => {
            // Find associated proposal if it exists
            const proposal = proposals.find((p) => p.projectId === project.id);
            const hasActiveProposal = proposal && proposal.status === "active";
            const hasEndedProposal = proposal && proposal.status === "ended";

            return (
              <div
                key={project.id}
                className={`${styles.proposalCard} ${
                  selectedProject === project.id ? styles.selectedProposal : ""
                } ${hasActiveProposal ? styles.activeProposal : ""}`}
                onClick={() =>
                  hasActiveProposal ? setSelectedProject(project.id) : null
                }
              >
                <div className={styles.proposalHeader}>
                  <div>
                    <span className={styles.proposalId}>
                      Project #{project.id}
                    </span>
                    {hasActiveProposal && (
                      <span
                        className={`${styles.statusBadge} ${styles.statusActive}`}
                      >
                        Voting Active
                      </span>
                    )}
                    {hasEndedProposal && (
                      <span
                        className={`${styles.statusBadge} ${styles.statusEnded}`}
                      >
                        Voting Ended
                      </span>
                    )}
                    {!proposal && (
                      <span
                        className={`${styles.statusBadge} ${styles.statusPending}`}
                      >
                        No Voting Yet
                      </span>
                    )}
                  </div>
                  {hasActiveProposal && (
                    <div className={styles.proposalDeadline}>
                      {formatTimeRemaining(proposal.endTime)}
                    </div>
                  )}
                </div>

                <h4 className={styles.proposalTitle}>{project.name}</h4>

                <div className={styles.projectDetails}>
                  <div className={styles.detailItem}>
                    <CurrencyEth size={16} />
                    <div>
                      <span className={styles.detailLabel}>Funding Goal</span>
                      <span className={styles.detailValue}>
                        {project.fundingGoal} ETH
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <Users size={16} />
                    <div>
                      <span className={styles.detailLabel}>Proposer</span>
                      <span className={styles.detailValue}>
                        {project.proposer.substring(0, 6)}...
                        {project.proposer.substring(
                          project.proposer.length - 4
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Create voting proposal button - show if project has no proposal */}
                {!proposal && project.isActive && (
                  <div className={styles.projectActions}>
                    <button
                      className={styles.createProposalButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        createVotingProposal(project.id);
                      }}
                      disabled={creatingProposal === project.id || !isActive}
                    >
                      {creatingProposal === project.id ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Calendar size={16} />
                          Create Voting Proposal
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Voting interface - show if project has active proposal and is selected */}
                {selectedProject === project.id && hasActiveProposal && (
                  <div className={styles.voteOptions}>
                    <h5 className={styles.voteTitle}>Cast Your Vote</h5>
                    <div className={styles.voteButtons}>
                      <button
                        className={`${styles.voteButton} ${
                          voteOption === "for" ? styles.selected : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVoteOption("for");
                        }}
                      >
                        <CheckCircle
                          size={20}
                          weight={voteOption === "for" ? "fill" : "regular"}
                        />
                        For
                      </button>
                      <button
                        className={`${styles.voteButton} ${
                          voteOption === "against" ? styles.selected : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVoteOption("against");
                        }}
                      >
                        <X
                          size={20}
                          weight={voteOption === "against" ? "fill" : "regular"}
                        />
                        Against
                      </button>
                      <button
                        className={`${styles.voteButton} ${
                          voteOption === "abstain" ? styles.selected : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVoteOption("abstain");
                        }}
                      >
                        <Minus
                          size={20}
                          weight={voteOption === "abstain" ? "fill" : "regular"}
                        />
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
                          <div
                            className={`${styles.encryptionStep} ${styles.active}`}
                          >
                            <Lock size={18} className={styles.encryptionIcon} />
                            <span>Encrypting Vote</span>
                            <CheckSquare
                              size={14}
                              className={styles.checkIcon}
                            />
                          </div>
                          <ArrowRight size={14} className={styles.arrowIcon} />
                          <div
                            className={`${styles.encryptionStep} ${styles.active}`}
                          >
                            <ShieldCheck
                              size={18}
                              className={styles.encryptionIcon}
                            />
                            <span>TEE Processing</span>
                          </div>
                          <ArrowRight size={14} className={styles.arrowIcon} />
                          <div className={styles.encryptionStep}>
                            <CheckCircle
                              size={18}
                              className={styles.encryptionIcon}
                            />
                            <span>Vote Registered</span>
                          </div>
                        </div>
                        <div className={styles.teeIndicator}>
                          <ShieldCheck size={16} />
                          <span>
                            Vote being processed in Trusted Execution
                            Environment
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Transaction Hash Display */}
                    {txHash && (
                      <div className={styles.transactionInfo}>
                        <p>Transaction submitted:</p>
                        <a
                          href={getExplorerUrl(txHash, chainId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.txHashLink}
                        >
                          {txHash.substring(0, 10)}...
                          {txHash.substring(txHash.length - 8)}
                          <ArrowRight size={12} className={styles.linkIcon} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Show result for ended proposals */}
                {hasEndedProposal && proposal.finalized && (
                  <div className={styles.proposalResult}>
                    <div
                      className={`${styles.resultBadge} ${
                        proposal.approved
                          ? styles.approvedBadge
                          : styles.rejectedBadge
                      }`}
                    >
                      {proposal.approved ? "Approved" : "Rejected"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {voteSuccess && (
        <div className={styles.successMessage}>
          <CheckCircle size={20} weight="fill" />
          <span>
            Your vote has been successfully submitted and is being processed
            securely.
          </span>
        </div>
      )}

      {createSuccess && (
        <div className={styles.successMessage}>
          <CheckCircle size={20} weight="fill" />
          <span>
            Voting proposal created successfully! Users can now vote on this
            project.
          </span>
          {txHash && (
            <div className={styles.transactionInfo}>
              <span>Transaction: </span>
              <a
                href={getExplorerUrl(txHash, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.txHashLink}
              >
                {txHash.substring(0, 10)}...
                {txHash.substring(txHash.length - 8)}
                <ArrowRight size={12} className={styles.linkIcon} />
              </a>
            </div>
          )}
        </div>
      )}

      <div className={styles.teeExplanation}>
        <div className={styles.teeIcon}>
          <LockKey size={24} weight="fill" />
        </div>
        <div className={styles.teeContent}>
          <h3 className={styles.teeTitle}>Privacy-Protected Voting</h3>
          <p className={styles.teeText}>
            All votes are encrypted and processed in Trusted Execution
            Environments (TEEs). This ensures that your voting choices remain
            confidential while maintaining the integrity of the governance
            process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VotingInterface;
