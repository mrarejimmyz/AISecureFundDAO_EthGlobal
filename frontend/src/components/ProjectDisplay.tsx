import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import ProductRegistryABI from "../utils/ProductRegistryABI.json";
import PrivateVotingABI from "../utils/PrivateVotingABI.json";
import styles from "./ProjectDisplay.module.css";
import {
  CheckCircle,
  Clock,
  ArrowRight,
  LockKey,
  ShieldCheck,
  Users,
  CurrencyEth,
  X,
} from "phosphor-react";

// Contract addresses
const PROJECT_REGISTRY_ADDRESS = "0x485641b60be6e9bd662a9cecb58d66874257aa25";
const PRIVATE_VOTING_ADDRESS = "0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb";

type VotingStatus = "active" | "ended" | "not created";

interface Project {
  id: string;
  name: string;
  proposer: string;
  fundingGoal: string;
  isActive: boolean;
  hasVotingProposal: boolean;
  votingStatus: VotingStatus;
  votingEndTime?: number;
}

const ProjectDisplay: React.FC = () => {
  const { provider, isActive } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingProposal, setCreatingProposal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

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

  useEffect(() => {
    console.log("ProjectDisplay component mounted");

    const fetchProjects = async () => {
      if (!provider) {
        console.log("No provider available");
        return;
      }

      try {
        console.log("Starting to fetch projects...");
        setLoading(true);
        setError(null);

        // Create contract instance for ProjectRegistry
        const projectContract = new ethers.Contract(
          PROJECT_REGISTRY_ADDRESS,
          ProductRegistryABI,
          provider
        );

        // Get the total count of projects
        const count = await projectContract.projectCount();
        console.log("Project count:", count.toString());

        if (count.toString() === "0") {
          console.log("No projects found");
          setProjects([]);
          setLoading(false);
          return;
        }

        // Create an array to store projects
        const projectsList: Project[] = [];

        // Iterate from 1 to count (assuming IDs start at 1)
        for (let i = 1; i <= count; i++) {
          try {
            console.log(`Fetching project ${i}...`);
            const project = await projectContract.projects(i);
            console.log(`Project ${i} data:`, project);

            // Add project to list
            projectsList.push({
              id: project.id.toString(),
              name: project.name,
              proposer: project.proposer,
              fundingGoal: ethers.formatEther(project.fundingGoal),
              isActive: project.isActive,
              hasVotingProposal: false,
              votingStatus: "not created",
            });
          } catch (error) {
            console.error(`Error fetching project ${i}:`, error);
          }
        }

        console.log("Projects fetched:", projectsList);

        // Now try to check voting status for each project
        try {
          console.log("Checking voting status for projects...");

          const votingContract = new ethers.Contract(
            PRIVATE_VOTING_ADDRESS,
            PrivateVotingABI,
            provider
          );

          // Current timestamp for checking if proposal is active
          const currentTime = Math.floor(Date.now() / 1000);

          // Check voting status for each project
          const projectsWithVotingStatus = await Promise.all(
            projectsList.map(async (project) => {
              try {
                // Try to get proposal details from the voting contract
                console.log(`Checking voting for project ${project.id}...`);
                const votingDetails = await votingContract.getProposalDetails(
                  project.id
                );

                // Only using endTime and finalized
                const [, endTime, finalized] = votingDetails;

                // Determine if voting is active
                const isVotingActive =
                  !finalized && endTime.toNumber() > currentTime;

                return {
                  ...project,
                  hasVotingProposal: true,
                  votingStatus: isVotingActive
                    ? "active"
                    : ("ended" as VotingStatus),
                  votingEndTime: endTime.toNumber(),
                };
              } catch (err) {
                // If there's an error, assume no voting proposal exists
                console.log(`No voting proposal for project ${project.id}`);
                return project; // Return the project as is
              }
            })
          );

          console.log("Projects with voting status:", projectsWithVotingStatus);
          // Ensure the returned array is of type Project[]
          setProjects(projectsWithVotingStatus as Project[]);
        } catch (err) {
          console.error("Error checking voting status:", err);
          // If we can't check voting status, just show the projects anyway
          setProjects(projectsList);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [provider, successMessage]);

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

      // Call the createProposal function from your ABI
      const tx = await votingContract.createProposal(projectId, duration);
      console.log("Transaction sent:", tx.hash);

      // Set the transaction hash for display
      setTxHash(tx.hash);

      // Wait for the transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");

      setSuccessMessage(`Voting proposal created for project #${projectId}`);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
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

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);

    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className={styles.projectsContainer}>
      <h2 className={styles.projectsTitle}>Project Proposals</h2>

      {!isActive && (
        <div className={styles.walletWarning}>
          <X size={24} />
          <p>Please connect your wallet to interact with projects</p>
        </div>
      )}

      {successMessage && (
        <div className={styles.successMessage}>
          <CheckCircle size={24} weight="fill" />
          <div className={styles.successContent}>
            <span>{successMessage}</span>
            {txHash && (
              <div className={styles.transactionInfo}>
                <span>Transaction Hash: </span>
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.hashLink}
                >
                  {txHash.substring(0, 10)}...
                  {txHash.substring(txHash.length - 8)}
                  <ArrowRight size={14} className={styles.linkIcon} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading projects...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No projects found. Be the first to submit a project!</p>
        </div>
      ) : (
        <div className={styles.projectsList}>
          {projects.map((project) => (
            <div
              key={project.id}
              className={`${styles.projectCard} ${
                project.votingStatus === "active"
                  ? styles.activeVoting
                  : project.votingStatus === "ended"
                  ? styles.endedVoting
                  : project.isActive
                  ? styles.activeProject
                  : styles.inactiveProject
              }`}
            >
              <div className={styles.projectHeader}>
                <span className={styles.projectId}>Project #{project.id}</span>
                <div className={styles.statusBadges}>
                  {project.isActive && (
                    <span className={styles.projectStatusBadge}>
                      <CheckCircle size={12} />
                      Project Active
                    </span>
                  )}

                  {project.votingStatus === "active" && (
                    <span className={styles.votingStatusBadge}>
                      <Users size={12} />
                      Voting Open
                    </span>
                  )}

                  {project.votingStatus === "ended" && (
                    <span className={styles.votingEndedBadge}>
                      <Clock size={12} />
                      Voting Ended
                    </span>
                  )}
                </div>
              </div>

              <h3 className={styles.projectTitle}>{project.name}</h3>

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
                      {project.proposer.substring(project.proposer.length - 4)}
                    </span>
                  </div>
                </div>

                {project.votingStatus === "active" && project.votingEndTime && (
                  <div className={styles.detailItem}>
                    <Clock size={16} />
                    <div>
                      <span className={styles.detailLabel}>Voting Time</span>
                      <span className={styles.detailValue}>
                        {formatTimeRemaining(project.votingEndTime)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.projectActions}>
                {!project.hasVotingProposal && project.isActive && (
                  <button
                    className={styles.createProposalButton}
                    onClick={() => createVotingProposal(project.id)}
                    disabled={creatingProposal === project.id || !isActive}
                  >
                    {creatingProposal === project.id ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Create Voting Proposal
                      </>
                    )}
                  </button>
                )}

                {project.votingStatus === "active" && (
                  <button
                    className={styles.voteButton}
                    onClick={() => (window.location.href = "#/voting")}
                  >
                    <Users size={16} />
                    Go to Voting
                  </button>
                )}
              </div>

              {project.votingStatus === "not created" && project.isActive && (
                <div className={styles.votingInfo}>
                  <LockKey size={16} />
                  <p>
                    Create a voting proposal to allow the community to vote on
                    this project
                  </p>
                </div>
              )}

              {project.votingStatus === "active" && (
                <div className={styles.votingInfo}>
                  <ShieldCheck size={16} />
                  <p>
                    This project is currently open for voting. Cast your vote in
                    the Voting section.
                  </p>
                </div>
              )}

              {project.votingStatus === "ended" && (
                <div className={styles.votingInfo}>
                  <Clock size={16} />
                  <p>
                    Voting for this project has ended. Check the results in the
                    Results section.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.refreshButton}>
        <button onClick={() => window.location.reload()}>
          Refresh Projects
        </button>
      </div>

      <div className={styles.teeExplanation}>
        <div className={styles.teeIcon}>
          <ShieldCheck size={24} weight="fill" />
        </div>
        <div className={styles.teeContent}>
          <h3 className={styles.teeTitle}>Private Voting with TEEs</h3>
          <p className={styles.teeText}>
            Projects go through a privacy-preserving voting process using
            Trusted Execution Environments (TEEs). This ensures that all votes
            remain confidential while maintaining the integrity of the results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDisplay;
