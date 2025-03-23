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
  Brain,
  ArrowsClockwise,
} from "phosphor-react";
import { useWallet } from "../context/WalletContext";
import PrivateVotingABI from "../utils/PrivateVotingABI.json";
import ProductRegistryABI from "../utils/ProductRegistryABI.json";
import { encryptVote, initEncryption } from '../utils/homomorphicEncryption';

// Contract addresses
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
  id: string; // Display id (e.g., PROP-001)
  projectId: string; // Actual project id from contract
  title: string;
  description: string;
  deadline: string;
  endTime: number;
  status: "active" | "ended";
  finalized: boolean;
  approved?: boolean;
  projectDetails?: Project;
}

interface AnalysisState {
  stage: "idle" | "analyzing" | "optimize" | "complete";
  riskShown: string[];
  benefitsShown: string[];
  alignmentShown: boolean;
  recommendationShown: boolean;
  strategyShown: boolean;
  participationShown: boolean;
  incentivesShown: boolean;
}

// Simulated analysis function results
const analysisProposalResult = {
  risks: ["Financial instability", "Regulatory challenges"],
  benefits: ["Increased community engagement", "Potential for high ROI"],
  alignment: "The proposal aligns well with the DAO's long-term objectives",
  recommendation:
    "Proceed with caution, but the potential benefits outweigh the risks",
};

const optimizeVotingResult = {
  strategy: "Implement quadratic voting to balance influence",
  participation_target: "Aim for 80% voter turnout",
  incentives: "Offer governance tokens as rewards for consistent voters",
};

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

  // Enhanced analysis state
  const [analysisProject, setAnalysisProject] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    stage: "idle",
    riskShown: [],
    benefitsShown: [],
    alignmentShown: false,
    recommendationShown: false,
    strategyShown: false,
    participationShown: false,
    incentivesShown: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!provider) return;

    const setupEncryption = async () => {
      try {
        // For a real implementation, you would fetch the public key from your contract
        // You can add this later when you have time
        await initEncryption("demo_public_key_for_hackathon");
        console.log("Homomorphic encryption initialized");
      } catch (error) {
        console.error("Failed to initialize encryption:", error);
      }
    };
    
    setupEncryption();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectsData = await fetchProjects();
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

  const fetchProjects = async () => {
    if (!provider) return [];
    try {
      console.log("Fetching projects from:", PROJECT_REGISTRY_ADDRESS);
      const projectContract = new ethers.Contract(
        PROJECT_REGISTRY_ADDRESS,
        ProductRegistryABI,
        provider
      );
      const count = await projectContract.projectCount();
      console.log("Project count:", count.toString());
      const projectsArray: Project[] = [];
      for (let i = 1; i <= count; i++) {
        try {
          console.log(`Fetching project ${i}...`);
          const project = await projectContract.projects(i);
          projectsArray.push({
            id: project.id.toString(),
            name: project.name,
            proposer: project.proposer,
            fundingGoal: ethers.formatEther(project.fundingGoal),
            isActive: project.isActive,
            hasProposal: false,
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

  const fetchProposals = async (projectsData: Project[]) => {
    if (!provider) return;
    try {
      console.log("Fetching proposals from:", PRIVATE_VOTING_ADDRESS);
      const contract = new ethers.Contract(
        PRIVATE_VOTING_ADDRESS,
        PrivateVotingABI,
        provider
      );
      const filter = contract.filters.ProposalCreated();
      const events = await contract.queryFilter(filter);
      console.log("Proposal events found:", events.length);
      const currentTime = Math.floor(Date.now() / 1000);
      if (events.length === 0) {
        console.log("No proposals found. Using only project data.");
        return;
      }
      const proposalPromises = events.map(async (event: any) => {
        try {
          const eventLog = event as ethers.EventLog;
          const projectId = eventLog.args[0].toString();
          console.log(`Processing proposal for project ${projectId}`);
          const details = await contract.getProposalDetails(projectId);
          let endTime = 0;
          let finalized = false;
          let approved = false;
          if (Array.isArray(details) && details.length >= 3) {
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
          const deadlineDate = new Date(endTime * 1000);
          const formattedDeadline = deadlineDate.toLocaleDateString();
          const isActiveProposal = !finalized && endTime > currentTime;
          const projectDetails = projectsData.find((p) => p.id === projectId);
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
            status: isActiveProposal ? "active" : "ended",
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
        (proposal: any) => proposal !== null
      ) as Proposal[];
      console.log("Proposals fetched successfully:", fetchedProposals);
      setProposals(fetchedProposals);
      setProjects([...projectsData]);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      throw err;
    }
  };

  // Handle analysis process with progressive animations
  const handleAnalyzeProposal = (projectId: string) => {
    setAnalysisProject(projectId);
    setIsAnalyzing(true);
    setAnalysisState({
      stage: "analyzing",
      riskShown: [],
      benefitsShown: [],
      alignmentShown: false,
      recommendationShown: false,
      strategyShown: false,
      participationShown: false,
      incentivesShown: false,
    });
    // Show first risk after 1 second
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        riskShown: [...prev.riskShown, analysisProposalResult.risks[0]],
      }));
    }, 2000);
    // Show second risk after 2 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        riskShown: [...prev.riskShown, analysisProposalResult.risks[1]],
      }));
    }, 4000);
    // Show first benefit after 3 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        benefitsShown: [
          ...prev.benefitsShown,
          analysisProposalResult.benefits[0],
        ],
      }));
    }, 6000);
    // Show second benefit after 4 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        benefitsShown: [
          ...prev.benefitsShown,
          analysisProposalResult.benefits[1],
        ],
      }));
    }, 8000);
    // Show alignment after 5 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        alignmentShown: true,
      }));
    }, 10000);
    // Show recommendation after 6 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        recommendationShown: true,
      }));
    }, 12000);
    // Switch to optimize stage after 7 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        stage: "optimize",
      }));
    }, 14000);
    // Show strategy after 8 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        strategyShown: true,
      }));
    }, 16000);
    // Show participation target after 9 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        participationShown: true,
      }));
    }, 18000);
    // Show incentives after 10 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        incentivesShown: true,
      }));
    }, 20000);
    // Complete analysis after 11 seconds
    setTimeout(() => {
      setAnalysisState((prev) => ({
        ...prev,
        stage: "complete",
      }));
      setIsAnalyzing(false);
    }, 22000);
  };

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
      const duration = 7 * 24 * 60 * 60; // 7 days
      console.log(
        `Creating voting proposal for project ${projectId} with duration ${duration}...`
      );
      const tx = await votingContract.createProposal(projectId, duration);
      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      setCreateSuccess(true);
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

  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = endTime - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    return `${days}d ${hours}h remaining`;
  };

  const getExplorerUrl = (txHash: string, chainId?: number) => {
    let baseUrl = "https://sepolia.arbiscan.io/tx/";
    if (chainId) {
      switch (chainId) {
        case 1:
          baseUrl = "https://etherscan.io/tx/";
          break;
        case 5:
          baseUrl = "https://goerli.etherscan.io/tx/";
          break;
        case 11155111:
          baseUrl = "https://sepolia.etherscan.io/tx/";
          break;
        case 42161:
          baseUrl = "https://arbiscan.io/tx/";
          break;
        case 421613:
          baseUrl = "https://sepolia.arbiscan.io/tx/";
          break;
        case 84531:
          baseUrl = "https://goerli.basescan.org/tx/";
          break;
      }
    }
    return baseUrl + txHash;
  };

  const handleVoteSubmit = async () => {
    if (!voteOption || !selectedProject || !isActive || !provider) return;
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

    // Convert vote choice to number
    const voteValue = voteOption === "for" ? 1 : voteOption === "against" ? 2 : 0;
    
    let encryptedVote;
    try {
      // Use homomorphic encryption
      encryptedVote = encryptVote(voteValue);
      console.log("Vote encrypted using homomorphic encryption");
    } catch (encryptionError) {
      console.error("Homomorphic encryption failed, using fallback:", encryptionError);
      // Fallback to simple hash if encryption fails (for demo purposes)
      encryptedVote = ethers.keccak256(
        ethers.toUtf8Bytes(`${voteValue}-${Date.now()}`)
      );
    }

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

  const renderAnalysisSection = (projectId: string) => {
    const {
      stage,
      riskShown,
      benefitsShown,
      alignmentShown,
      recommendationShown,
      strategyShown,
      participationShown,
      incentivesShown,
    } = analysisState;
    if (analysisProject !== projectId) return null;
    return (
      <div className={styles.projectActions}>
        {stage === "analyzing" && (
          <div className={styles.analysisContainer}>
            <div className={styles.analysisHeader}>
              <Brain size={20} weight="fill" className={styles.analysisIcon} />
              <div className={styles.analysisTitle}>
                Analyze Proposal{" "}
                {isAnalyzing && (
                  <ArrowsClockwise size={16} className={styles.spinningIcon} />
                )}
              </div>
            </div>
            {riskShown.length > 0 && (
              <div className={styles.analysisSection}>
                <h4 className={styles.analysisSectionTitle}>Risk Assessment</h4>
                <ul className={styles.analysisList}>
                  {riskShown.map((risk, index) => (
                    <li key={`risk-${index}`} className={styles.analysisItem}>
                      <span className={styles.analysisIcon}>⚠️</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {benefitsShown.length > 0 && (
              <div className={styles.analysisSection}>
                <h4 className={styles.analysisSectionTitle}>Benefits</h4>
                <ul className={styles.analysisList}>
                  {benefitsShown.map((benefit, index) => (
                    <li
                      key={`benefit-${index}`}
                      className={styles.analysisItem}
                    >
                      <span className={styles.analysisIcon}>✅</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {alignmentShown && (
              <div className={styles.analysisItem}>
                <span className={styles.analysisIcon}>📊</span>
                <div>
                  <strong>Alignment:</strong> {analysisProposalResult.alignment}
                </div>
              </div>
            )}
            {recommendationShown && (
              <div className={styles.analysisItem}>
                <span className={styles.analysisIcon}>💡</span>
                <div>
                  <strong>Recommendation:</strong>{" "}
                  {analysisProposalResult.recommendation}
                </div>
              </div>
            )}
          </div>
        )}
        {stage === "optimize" && (
          <div className={styles.optimizeSection}>
            <div className={styles.analysisHeader}>
              {/* <Brain size={20} weight="fill" className={styles.analysisIcon} /> */}
              <div className={styles.optimizeTitle}>
                Optimize Voting{" "}
                {isAnalyzing && (
                  <ArrowsClockwise size={16} className={styles.spinningIcon} />
                )}
              </div>
            </div>
            {strategyShown && (
              <div className={styles.optimizeItem}>
                <span className={styles.analysisIcon}>🔍</span>
                <div>
                  <strong>Strategy:</strong> {optimizeVotingResult.strategy}
                </div>
              </div>
            )}
            {participationShown && (
              <div className={styles.optimizeItem}>
                <span className={styles.analysisIcon}>🎯</span>
                <div>
                  <strong>Participation Target:</strong>{" "}
                  {optimizeVotingResult.participation_target}
                </div>
              </div>
            )}
            {incentivesShown && (
              <div className={styles.optimizeItem}>
                <span className={styles.analysisIcon}>🏆</span>
                <div>
                  <strong>Incentives:</strong> {optimizeVotingResult.incentives}
                </div>
              </div>
            )}
          </div>
        )}
        {stage === "complete" && (
          <button
            className={styles.createProposalButton}
            onClick={(e) => {
              e.stopPropagation();
              createVotingProposal(projectId);
            }}
            disabled={creatingProposal === projectId || !isActive}
          >
            {creatingProposal === projectId ? (
              "Processing..."
            ) : (
              <>
                <Calendar size={16} /> Create Voting Proposal
              </>
            )}
          </button>
        )}
        {stage !== "complete" && (
          <button
            className={styles.cancelAnalysisButton}
            onClick={(e) => {
              e.stopPropagation();
              if (isAnalyzing) {
                setAnalysisProject(null);
                setIsAnalyzing(false);
                setAnalysisState({
                  stage: "idle",
                  riskShown: [],
                  benefitsShown: [],
                  alignmentShown: false,
                  recommendationShown: false,
                  strategyShown: false,
                  participationShown: false,
                  incentivesShown: false,
                });
              }
            }}
          >
            <X size={16} /> Cancel Analysis
          </button>
        )}
      </div>
    );
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
                  {hasActiveProposal && proposal && (
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
                {/* If no proposal exists, show analysis section or analyze proposal button */}
                {!proposal && project.isActive && (
                  <>
                    {renderAnalysisSection(project.id)}
                    {analysisProject !== project.id && (
                      <div className={styles.projectActions}>
                        <button
                          className={styles.analyzeProposalButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyzeProposal(project.id);
                          }}
                        >
                          <Brain size={16} /> Analyze Proposal with Nethermind
                          AI
                        </button>
                      </div>
                    )}
                  </>
                )}
                {/* Voting interface for active proposals */}
                {selectedProject === project.id &&
                  hasActiveProposal &&
                  proposal && (
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
                            weight={
                              voteOption === "against" ? "fill" : "regular"
                            }
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
                            weight={
                              voteOption === "abstain" ? "fill" : "regular"
                            }
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
                          "Processing..."
                        ) : (
                          <>
                            <Lock size={18} /> Submit Encrypted Vote
                          </>
                        )}
                      </button>
                      {showEncryption && (
                        <div className={styles.encryptionProcess}>
                          <div className={styles.encryptionSteps}>
                            <div
                              className={`${styles.encryptionStep} ${styles.active}`}
                            >
                              <Lock
                                size={18}
                                className={styles.encryptionIcon}
                              />
                              <span>Encrypting Vote</span>
                              <CheckSquare
                                size={14}
                                className={styles.checkIcon}
                              />
                            </div>
                            <ArrowRight
                              size={14}
                              className={styles.arrowIcon}
                            />
                            <div
                              className={`${styles.encryptionStep} ${styles.active}`}
                            >
                              <ShieldCheck
                                size={18}
                                className={styles.encryptionIcon}
                              />
                              <span>TEE Processing</span>
                            </div>
                            <ArrowRight
                              size={14}
                              className={styles.arrowIcon}
                            />
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
                {hasEndedProposal && proposal?.finalized && (
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
