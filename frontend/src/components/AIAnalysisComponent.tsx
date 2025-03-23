import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Brain,
  ChartPie,
  Users,
  CalendarCheck,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle,
  Warning,
  Info,
  LightbulbFilament,
  ArrowClockwise,
  ShieldCheck,
  Hash,
  Calendar,
  Gauge,
} from "phosphor-react";
import { useWallet } from "../context/WalletContext";
import PrivateVotingABI from "../utils/PrivateVotingABI.json";
import ProductRegistryABI from "../utils/ProductRegistryABI.json";
import styles from "./AIAnalysisComponent.module.css";

const PRIVATE_VOTING_ADDRESS = "0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb";
const PROJECT_REGISTRY_ADDRESS = "0x485641b60be6e9bd662a9cecb58d66874257aa25";

interface ProposalResult {
  results: {
    proposalId: number;
    counts: {
      inFavor: number;
      against: number;
      abstain: number;
    };
    total: number;
    tee_proof: string;
  };
  ai_insights: string;
  storage_key: string;
  tee_proof: string;
}

interface ProjectType {
  id: string;
  name: string;
  proposer: string;
  fundingGoal: string;
  isActive: boolean;
  hasProposal: boolean;
}

interface ProposalData {
  id: string; // Display id (e.g., PROP-001)
  projectId: string; // Actual project id from contract
  title: string;
  description: string;
  deadline: string;
  endTime: number;
  status: "active" | "ended";
  finalized: boolean;
  approved?: boolean;
  projectDetails?: ProjectType;
}

const AIAnalysis: React.FC = () => {
  const { provider } = useWallet();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ProposalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch proposals using the same logic as in VotingInterface.tsx
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        if (!provider) {
          setError("Provider not available. Please connect your wallet.");
          return;
        }

        // Get projects first (similar to VotingInterface.tsx)
        const projectContract = new ethers.Contract(
          PROJECT_REGISTRY_ADDRESS,
          ProductRegistryABI,
          provider
        );

        const count = await projectContract.projectCount();
        const projectsArray: {
          id: any;
          name: any;
          proposer: any;
          fundingGoal: string;
          isActive: any;
          hasProposal: boolean;
        }[] = [];

        for (let i = 1; i <= count; i++) {
          try {
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

        // Then get proposals related to these projects
        const votingContract = new ethers.Contract(
          PRIVATE_VOTING_ADDRESS,
          PrivateVotingABI,
          provider
        );

        const filter = votingContract.filters.ProposalCreated();
        const events = await votingContract.queryFilter(filter);
        const currentTime = Math.floor(Date.now() / 1000);

        const proposalPromises = events.map(async (event: any) => {
          try {
            const eventLog = event as ethers.EventLog;
            const projectId = eventLog.args[0].toString();

            const details = await votingContract.getProposalDetails(projectId);
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

            const deadlineDate = new Date(endTime * 1000);
            const formattedDeadline = deadlineDate.toLocaleDateString();
            const isActiveProposal = !finalized && endTime > currentTime;

            // Find matching project
            const projectDetails = projectsArray.find(
              (p) => p.id === projectId
            );
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
            } as ProposalData;
          } catch (err) {
            console.error("Error processing proposal event:", err);
            return null;
          }
        });

        // Use a type guard in the filter to remove null values
        const fetchedProposals = (await Promise.all(proposalPromises)).filter(
          (proposal): proposal is ProposalData => proposal !== null
        );

        setProposals(fetchedProposals);
      } catch (err) {
        console.error("Error fetching proposals:", err);
        setError("Failed to load proposals. Please try again later.");
      }
    };

    fetchProposals();
  }, [provider]);

  // Fetch proposal analysis
  const fetchProposalAnalysis = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/proposal/${projectId}/results`
      );
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error("Error fetching proposal analysis:", err);
      setError("No Vote Available, Please vote and try again.");

      // For demo purposes, set mock data when the API is not available
      setAnalysisData({
        results: {
          proposalId: parseInt(projectId),
          counts: {
            inFavor: 1,
            against: 1,
            abstain: 2,
          },
          total: 4,
          tee_proof: "0xc9854e74f99b3c77",
        },
        ai_insights:
          "**Voting Pattern Analysis**\n\n**Proposal ID:** " +
          projectId +
          "\n**Total Votes:** 4\n**Vote Distribution:**\n- **In Favor:** 1 (25%)\n- **Against:** 1 (25%)\n- **Abstain:** 2 (50%)\n\n**Voting Timeline:**\n- The voting period started at 1742706000000 (approximately January 1, 2023, 00:00:00 UTC) and ended at the same time, indicating a single-day voting period.\n\n**Insights:**\n\n1.  **Tie Vote:** The voting results are a tie, with 1 vote in favor and 1 vote against. This suggests that the proposal is highly contentious, and there is no clear consensus among voters.\n2.  **High Abstention Rate:** The high abstention rate of 50% indicates that a significant portion of voters chose not to participate in the voting process. This could be due to various reasons, such as lack of interest, uncertainty about the proposal, or technical difficulties.\n3.  **Single-Day Voting Period:** The short voting period may have contributed to the low voter turnout and the high abstention rate. A longer voting period could have allowed more voters to participate and potentially changed the outcome.\n4.  **Need for Further Discussion:** The tie vote and high abstention rate suggest that the proposal may require further discussion and clarification to gain more support from voters.\n\n**Recommendations:**\n\n1.  **Reconsider Voting Period:** Consider extending the voting period to allow more voters to participate and potentially change the outcome.\n2.  **Clarify Proposal:** Provide additional information and clarification about the proposal to address concerns and uncertainties among voters.\n3.  **Engage Voters:** Encourage more voters to participate in the discussion and voting process by addressing technical difficulties and promoting awareness about the proposal.\n\n**Next Steps:**\n\n1.  **Review and Refine Proposal:** Review the proposal and refine it based on the insights and recommendations above.\n2.  **Engage Voters:** Engage with voters to address concerns and promote awareness about the refined proposal.\n3.  **Schedule Re-Vote:** Schedule a re-vote on the refined proposal to allow more voters to participate and potentially change the outcome.",
        storage_key: "vote_results_" + projectId,
        tee_proof: "0xc9854e74f99b3c77",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle proposal selection
  const handleProposalSelect = (projectId: string) => {
    setSelectedProposal(projectId);
    fetchProposalAnalysis(projectId);
  };

  // Parse and render AI insights
  const renderAIInsights = (insights: string) => {
    // Parse markdown-like content into sections
    const sections = insights.split("\n\n");

    // Define our section rendering
    return (
      <div className={styles.insightsContainer}>
        {sections.map((section, index) => {
          if (section.startsWith("**Voting Pattern Analysis**")) {
            return (
              <div key={index} className={styles.insightsHeader}>
                <Brain
                  size={24}
                  weight="fill"
                  className={styles.insightsHeaderIcon}
                />
                <h3>Voting Pattern Analysis</h3>
              </div>
            );
          } else if (section.startsWith("**Proposal ID:**")) {
            const lines = section.split("\n");
            return (
              <div key={index} className={styles.basicInfoSection}>
                {lines.map((line, i) => {
                  if (line.includes("**Proposal ID:**")) {
                    return (
                      <div key={`info-${i}`} className={styles.infoItem}>
                        <Hash size={18} />
                        <span className={styles.infoLabel}>Proposal ID:</span>
                        <span className={styles.infoValue}>
                          {line.split("**Proposal ID:**")[1].trim()}
                        </span>
                      </div>
                    );
                  } else if (line.includes("**Total Votes:**")) {
                    return (
                      <div key={`info-${i}`} className={styles.infoItem}>
                        <Users size={18} />
                        <span className={styles.infoLabel}>Total Votes:</span>
                        <span className={styles.infoValue}>
                          {line.split("**Total Votes:**")[1].trim()}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          } else if (section.startsWith("**Vote Distribution:**")) {
            const lines = section.split("\n");
            return (
              <div key={index} className={styles.distributionSection}>
                <h4 className={styles.sectionTitle}>
                  <ChartPie size={20} />
                  Vote Distribution
                </h4>
                <div className={styles.voteBars}>
                  {lines.map((line, i) => {
                    if (i === 0) return null;
                    if (line.includes("**In Favor:**")) {
                      const percentage = line.match(/\((\d+)%\)/)?.[1] || "0";
                      return (
                        <div
                          key={`dist-${i}`}
                          className={styles.voteBarContainer}
                        >
                          <div className={styles.voteBarLabel}>
                            <ThumbsUp size={16} />
                            <span>In Favor</span>
                          </div>
                          <div className={styles.voteBarWrapper}>
                            <div
                              className={`${styles.voteBar} ${styles.inFavorBar}`}
                              style={{ width: `${percentage}%` }}
                            >
                              {parseInt(percentage) > 10
                                ? `${percentage}%`
                                : ""}
                            </div>
                          </div>
                          <span className={styles.voteValue}>
                            {line.split("**In Favor:**")[1].trim()}
                          </span>
                        </div>
                      );
                    } else if (line.includes("**Against:**")) {
                      const percentage = line.match(/\((\d+)%\)/)?.[1] || "0";
                      return (
                        <div
                          key={`dist-${i}`}
                          className={styles.voteBarContainer}
                        >
                          <div className={styles.voteBarLabel}>
                            <ThumbsDown size={16} />
                            <span>Against</span>
                          </div>
                          <div className={styles.voteBarWrapper}>
                            <div
                              className={`${styles.voteBar} ${styles.againstBar}`}
                              style={{ width: `${percentage}%` }}
                            >
                              {parseInt(percentage) > 10
                                ? `${percentage}%`
                                : ""}
                            </div>
                          </div>
                          <span className={styles.voteValue}>
                            {line.split("**Against:**")[1].trim()}
                          </span>
                        </div>
                      );
                    } else if (line.includes("**Abstain:**")) {
                      const percentage = line.match(/\((\d+)%\)/)?.[1] || "0";
                      return (
                        <div
                          key={`dist-${i}`}
                          className={styles.voteBarContainer}
                        >
                          <div className={styles.voteBarLabel}>
                            <Minus size={16} />
                            <span>Abstain</span>
                          </div>
                          <div className={styles.voteBarWrapper}>
                            <div
                              className={`${styles.voteBar} ${styles.abstainBar}`}
                              style={{ width: `${percentage}%` }}
                            >
                              {parseInt(percentage) > 10
                                ? `${percentage}%`
                                : ""}
                            </div>
                          </div>
                          <span className={styles.voteValue}>
                            {line.split("**Abstain:**")[1].trim()}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          } else if (section.startsWith("**Voting Timeline:**")) {
            return (
              <div key={index} className={styles.timelineSection}>
                <h4 className={styles.sectionTitle}>
                  <Calendar size={20} />
                  Voting Timeline
                </h4>
                <p>{section.split("**Voting Timeline:**\n-")[1].trim()}</p>
              </div>
            );
          } else if (section.startsWith("**Insights:**")) {
            const insightItems = section.split("\n\n").slice(1);
            return (
              <div key={index} className={styles.insightsSection}>
                <h4 className={styles.sectionTitle}>
                  <Brain size={20} />
                  AI Insights
                </h4>
                <div className={styles.insightsList}>
                  {insightItems.map((item, itemIndex) => {
                    const itemContent = item
                      .replace(/^\d+\.\s+\*\*([^*]+)\*\*:/, "")
                      .trim();
                    const itemTitle =
                      item.match(/^\d+\.\s+\*\*([^*]+)\*\*/)?.[1] || "Insight";
                    let icon;
                    if (itemTitle.includes("Tie Vote")) {
                      icon = <Gauge size={18} />;
                    } else if (itemTitle.includes("Abstention")) {
                      icon = <Minus size={18} />;
                    } else if (itemTitle.includes("Period")) {
                      icon = <Calendar size={18} />;
                    } else if (itemTitle.includes("Discussion")) {
                      icon = <Users size={18} />;
                    } else {
                      icon = <Info size={18} />;
                    }
                    return (
                      <div
                        key={`insight-${itemIndex}`}
                        className={styles.insightItem}
                      >
                        <div className={styles.insightIcon}>{icon}</div>
                        <div className={styles.insightContent}>
                          <h5 className={styles.insightTitle}>{itemTitle}</h5>
                          <p className={styles.insightDescription}>
                            {itemContent}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else if (section.startsWith("**Recommendations:**")) {
            const recommendationItems = section.split("\n\n").slice(1);
            return (
              <div key={index} className={styles.recommendationsSection}>
                <h4 className={styles.sectionTitle}>
                  <LightbulbFilament size={20} />
                  Recommendations
                </h4>
                <div className={styles.recommendationsList}>
                  {recommendationItems.map((item, itemIndex) => {
                    const itemContent = item
                      .replace(/^\d+\.\s+\*\*([^*]+)\*\*:/, "")
                      .trim();
                    const itemTitle =
                      item.match(/^\d+\.\s+\*\*([^*]+)\*\*/)?.[1] ||
                      "Recommendation";
                    let icon;
                    if (itemTitle.includes("Voting Period")) {
                      icon = <Calendar size={18} />;
                    } else if (itemTitle.includes("Clarify")) {
                      icon = <Info size={18} />;
                    } else if (itemTitle.includes("Engage")) {
                      icon = <Users size={18} />;
                    } else {
                      icon = <LightbulbFilament size={18} />;
                    }
                    return (
                      <div
                        key={`recommendation-${itemIndex}`}
                        className={styles.recommendationItem}
                      >
                        <div className={styles.recommendationIcon}>{icon}</div>
                        <div className={styles.recommendationContent}>
                          <h5 className={styles.recommendationTitle}>
                            {itemTitle}
                          </h5>
                          <p className={styles.recommendationDescription}>
                            {itemContent}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else if (section.startsWith("**Next Steps:**")) {
            const stepItems = section.split("\n\n").slice(1);
            return (
              <div key={index} className={styles.nextStepsSection}>
                <h4 className={styles.sectionTitle}>
                  <ArrowRight size={20} />
                  Next Steps
                </h4>
                <div className={styles.stepsList}>
                  {stepItems.map((item, itemIndex) => {
                    const itemContent = item
                      .replace(/^\d+\.\s+\*\*([^*]+)\*\*:/, "")
                      .trim();
                    const itemTitle =
                      item.match(/^\d+\.\s+\*\*([^*]+)\*\*/)?.[1] || "Step";
                    let icon;
                    if (itemTitle.includes("Review")) {
                      icon = <CheckCircle size={18} />;
                    } else if (itemTitle.includes("Engage")) {
                      icon = <Users size={18} />;
                    } else if (itemTitle.includes("Schedule")) {
                      icon = <CalendarCheck size={18} />;
                    } else {
                      icon = <ArrowRight size={18} />;
                    }
                    return (
                      <div
                        key={`step-${itemIndex}`}
                        className={styles.stepItem}
                      >
                        <div className={styles.stepIcon}>{icon}</div>
                        <div className={styles.stepContent}>
                          <h5 className={styles.stepTitle}>{itemTitle}</h5>
                          <p className={styles.stepDescription}>
                            {itemContent}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <p key={index} className={styles.plainText}>
              {section}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.aiAnalysisContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <Brain size={24} weight="fill" />
          AI-Enhanced Governance Analysis
        </h2>
        <p className={styles.sectionDescription}>
          View detailed AI analysis of voting patterns and outcomes for
          completed proposals. All analyses are processed securely in TEEs to
          maintain data privacy.
        </p>
      </div>

      <div className={styles.analysisContent}>
        <div className={styles.proposalsList}>
          <h3 className={styles.subSectionTitle}>Ongoinging Proposals</h3>
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`${styles.proposalCard} ${
                selectedProposal === proposal.projectId
                  ? styles.selectedProposal
                  : ""
              }`}
              onClick={() => handleProposalSelect(proposal.projectId)}
            >
              <div className={styles.proposalHeader}>
                <span className={styles.proposalId}>{proposal.id}</span>
                <div
                  className={`${styles.proposalStatus} ${
                    proposal.approved
                      ? styles.statusApproved
                      : styles.statusApproved
                  }`}
                >
                  {proposal.approved ? (
                    <>
                      <CheckCircle size={14} weight="fill" />
                      Approved
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} weight="fill" />
                      Ongoing
                    </>
                  )}
                </div>
              </div>
              <h4 className={styles.proposalTitle}>{proposal.title}</h4>
              <p className={styles.proposalDescription}>
                {proposal.description}
              </p>
              <div className={styles.proposalFooter}>
                <div className={styles.proposalDeadline}>
                  <CalendarCheck size={14} />
                  <span>Ended: {proposal.deadline}</span>
                </div>
                <button
                  className={styles.viewAnalysisButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProposalSelect(proposal.projectId);
                  }}
                >
                  <Brain size={14} />
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.analysisPanel}>
          {error && (
            <div className={styles.errorMessage}>
              <Warning size={20} />
              <p>{error}</p>
            </div>
          )}
          {loading && (
            <div className={styles.loadingState}>
              <ArrowClockwise size={24} className={styles.spinningIcon} />
              <p>Loading AI analysis...</p>
            </div>
          )}
          {!loading && !error && selectedProposal && analysisData && (
            <>
              <div className={styles.analysisPanelHeader}>
                <div className={styles.analysisTitleArea}>
                  <h3 className={styles.analysisTitle}>
                    Analysis for Proposal #{selectedProposal}
                  </h3>
                  <div className={styles.teeVerification}>
                    <ShieldCheck size={16} />
                    <span>TEE Verified</span>
                    <span className={styles.proofHash}>
                      {analysisData.tee_proof.substring(0, 10)}...
                    </span>
                  </div>
                </div>
                {analysisData.results && (
                  <div className={styles.voteSummary}>
                    <div className={styles.voteCount}>
                      <ThumbsUp size={16} className={styles.inFavorIcon} />
                      <span>{analysisData.results.counts.inFavor}</span>
                    </div>
                    <div className={styles.voteCount}>
                      <ThumbsDown size={16} className={styles.againstIcon} />
                      <span>{analysisData.results.counts.against}</span>
                    </div>
                    <div className={styles.voteCount}>
                      <Minus size={16} className={styles.abstainIcon} />
                      <span>{analysisData.results.counts.abstain}</span>
                    </div>
                    <div className={styles.totalVotes}>
                      <Users size={16} />
                      <span>{analysisData.results.total} total</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.analysisContent}>
                {renderAIInsights(analysisData.ai_insights)}
              </div>
            </>
          )}
          {!loading && !error && !selectedProposal && (
            <div className={styles.noSelectionState}>
              <Brain
                size={48}
                weight="light"
                className={styles.noSelectionIcon}
              />
              <p>Select a proposal to view its AI-enhanced analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
