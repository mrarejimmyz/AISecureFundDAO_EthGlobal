import React, { useState } from "react";
import {
  ChartPieSlice,
  ChartBar,
  ChartLine,
  Brain,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Users,
  CurrencyEth,
  Robot,
  LockKey,
  ArrowRight,
  FileText,
  Hash,
  Eye,
  Info,
  Lightning,
} from "phosphor-react";
import AIAnalysis from "./AIAnalysisComponent";
import styles from "./ResultsVisualization.module.css";

// Mock data for completed proposals
const completedProposals = [
  {
    id: "PROP-12",
    title: "Zero-Knowledge Governance Implementation",
    description:
      "Implementation of zero-knowledge proofs for DAO governance to enhance privacy.",
    votesFor: 284,
    votesAgainst: 34,
    votesAbstain: 12,
    totalVotes: 330,
    status: "passed",
    category: "development",
    fundingAllocated: 320,
    completedDate: "2025-02-10",
    aiInsights: [
      "Strong community support (86% approval)",
      "Similar proposals have seen 92% implementation success rate",
      "Recommended milestone-based funding release",
    ],
    verificationStatus: "verified",
  },
  {
    id: "PROP-09",
    title: "Multi-Chain TEE Extension",
    description:
      "Extend trusted execution environment capabilities to support multiple blockchain networks.",
    votesFor: 190,
    votesAgainst: 105,
    votesAbstain: 25,
    totalVotes: 320,
    status: "passed",
    category: "research",
    fundingAllocated: 250,
    completedDate: "2025-01-18",
    aiInsights: [
      "Moderate consensus (59% approval)",
      "Technical complexity is high, suggesting staged implementation",
      "Recommended collaboration with Marlin and t1 Protocol teams",
    ],
    verificationStatus: "verified",
  },
  {
    id: "PROP-07",
    title: "Privacy-Enhanced NFT Standards",
    description:
      "Research and develop standards for NFTs with privacy-preserving attributes and ownership.",
    votesFor: 150,
    votesAgainst: 170,
    votesAbstain: 5,
    totalVotes: 325,
    status: "rejected",
    category: "research",
    fundingAllocated: 0,
    completedDate: "2025-01-05",
    aiInsights: [
      "Proposal rejected with 46% approval",
      "Main concerns centered on potential regulatory implications",
      "Suggestion to revise with stronger compliance considerations",
    ],
    verificationStatus: "verified",
  },
  {
    id: "PROP-04",
    title: "Community Education Initiative",
    description:
      "Fund educational content on privacy-preserving technologies and TEEs for wider adoption.",
    votesFor: 315,
    votesAgainst: 5,
    votesAbstain: 10,
    totalVotes: 330,
    status: "passed",
    category: "education",
    fundingAllocated: 180,
    completedDate: "2024-12-20",
    aiInsights: [
      "Extremely high support (95% approval)",
      "Education initiatives show strong ROI for ecosystem growth",
      "Recommended expanding scope to include interactive tutorials",
    ],
    verificationStatus: "verified",
  },
];

// Mock data for completed auctions
const completedAuctions = [
  {
    id: "AUC-08",
    title: "AI Research Funding Round",
    description:
      "Funding for research into AI-driven privacy-preserving analytics.",
    winningBid: 280,
    totalBids: 14,
    winner: "0x7F2e...A1dB",
    completedDate: "2025-02-15",
    aiInsights: [
      "Competitive auction with 14 participants",
      "Final price 40% above initial reserve",
      "Winner has strong track record in AI research",
    ],
    verificationStatus: "verified",
  },
  {
    id: "AUC-06",
    title: "ZK-Infrastructure Development",
    description:
      "Development of zero-knowledge proof infrastructure for privacy-preserving applications.",
    winningBid: 350,
    totalBids: 8,
    winner: "0x3A5b...C7d9",
    completedDate: "2025-01-25",
    aiInsights: [
      "Highest value auction to date",
      "Strategic importance reflected in bid pricing",
      "Expected completion timeline of 4 months",
    ],
    verificationStatus: "verified",
  },
  {
    id: "AUC-05",
    title: "Governance Dashboard",
    description:
      "Development of an interactive dashboard for DAO governance tracking and visualization.",
    winningBid: 120,
    totalBids: 6,
    winner: "0xB2c8...9F4e",
    completedDate: "2025-01-12",
    aiInsights: [
      "Moderate bidding activity",
      "Final price aligned with market expectations",
      "Recommend integration with existing analytics platform",
    ],
    verificationStatus: "verified",
  },
];

// Mock data for funding distribution
const fundingDistributionData = [
  { category: "Development", amount: 520, color: "#3b82f6" },
  { category: "Research", amount: 320, color: "#8b5cf6" },
  { category: "Education", amount: 180, color: "#10b981" },
  { category: "Community", amount: 120, color: "#f59e0b" },
  { category: "Infrastructure", amount: 150, color: "#ef4444" },
];

// Mock data for quarterly funding trend
const quarterlyFundingData = [
  { quarter: "Q1 2024", amount: 250 },
  { quarter: "Q2 2024", amount: 320 },
  { quarter: "Q3 2024", amount: 420 },
  { quarter: "Q4 2024", amount: 480 },
  { quarter: "Q1 2025", amount: 570 },
];

const ResultsVisualization: React.FC = () => {
  // Updated to include a new 'ai-analysis' tab
  const [activeTab, setActiveTab] = useState<
    "ai-analysis" | "proposals" | "auctions" | "analytics"
  >("ai-analysis");
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);

  // Calculate total funding
  const totalFunding = fundingDistributionData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const renderStatusBadge = (status: string) => {
    const isVerified = status === "verified";
    return (
      <div
        className={`${styles.statusBadge} ${
          isVerified ? styles.verifiedBadge : styles.pendingBadge
        }`}
      >
        {isVerified ? (
          <>
            <ShieldCheck size={14} weight="fill" />
            TEE Verified
          </>
        ) : (
          <>
            <Info size={14} />
            Pending Verification
          </>
        )}
      </div>
    );
  };

  const renderProposalVotingResults = (
    proposal: (typeof completedProposals)[0]
  ) => {
    const totalVotes = proposal.totalVotes;
    const forPercentage = Math.round((proposal.votesFor / totalVotes) * 100);
    const againstPercentage = Math.round(
      (proposal.votesAgainst / totalVotes) * 100
    );
    const abstainPercentage = Math.round(
      (proposal.votesAbstain / totalVotes) * 100
    );

    return (
      <div className={styles.votingResults}>
        <h4 className={styles.votingResultsTitle}>Voting Results</h4>

        <div className={styles.votingResultsBar}>
          <div
            className={styles.votesForBar}
            style={{ width: `${forPercentage}%` }}
            title={`${proposal.votesFor} votes (${forPercentage}%)`}
          >
            {forPercentage >= 15 ? `${forPercentage}%` : ""}
          </div>
          <div
            className={styles.votesAgainstBar}
            style={{ width: `${againstPercentage}%` }}
            title={`${proposal.votesAgainst} votes (${againstPercentage}%)`}
          >
            {againstPercentage >= 15 ? `${againstPercentage}%` : ""}
          </div>
          <div
            className={styles.votesAbstainBar}
            style={{ width: `${abstainPercentage}%` }}
            title={`${proposal.votesAbstain} votes (${abstainPercentage}%)`}
          >
            {abstainPercentage >= 15 ? `${abstainPercentage}%` : ""}
          </div>
        </div>

        <div className={styles.votingLegend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: "#10b981" }}
            ></div>
            <div className={styles.legendLabel}>
              For: {proposal.votesFor} votes
            </div>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: "#ef4444" }}
            ></div>
            <div className={styles.legendLabel}>
              Against: {proposal.votesAgainst} votes
            </div>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: "#94a3b8" }}
            ></div>
            <div className={styles.legendLabel}>
              Abstain: {proposal.votesAbstain} votes
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAiInsights = (insights: string[]) => {
    return (
      <div className={styles.aiInsightsSection}>
        <h4 className={styles.aiInsightsTitle}>
          <Brain size={18} />
          AI-Enhanced Insights
        </h4>
        <ul className={styles.aiInsightsList}>
          {insights.map((insight, index) => (
            <li key={index} className={styles.aiInsightItem}>
              <Robot size={16} />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderProposalResults = () => {
    return (
      <div className={styles.resultsSection}>
        <div className={styles.resultsList}>
          {completedProposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`${styles.resultCard} ${
                selectedProposal === proposal.id ? styles.selectedCard : ""
              }`}
              onClick={() => setSelectedProposal(proposal.id)}
            >
              <div className={styles.resultHeader}>
                <span className={styles.resultId}>{proposal.id}</span>
                <div
                  className={`${styles.resultStatus} ${
                    proposal.status === "passed"
                      ? styles.passedStatus
                      : styles.rejectedStatus
                  }`}
                >
                  {proposal.status === "passed" ? (
                    <>
                      <CheckCircle size={14} weight="fill" />
                      Passed
                    </>
                  ) : (
                    <>
                      <Info size={14} />
                      Rejected
                    </>
                  )}
                </div>
              </div>

              <h3 className={styles.resultTitle}>{proposal.title}</h3>
              <p className={styles.resultDescription}>{proposal.description}</p>

              {renderProposalVotingResults(proposal)}

              <div className={styles.resultFooter}>
                {renderStatusBadge(proposal.verificationStatus)}

                {proposal.status === "passed" && (
                  <div className={styles.fundingBadge}>
                    <CurrencyEth size={14} />
                    {proposal.fundingAllocated} ETH Allocated
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedProposal && (
          <div className={styles.resultDetails}>
            <div className={styles.detailsHeader}>
              <h3 className={styles.detailsTitle}>
                <FileText size={18} />
                Proposal Details
              </h3>
            </div>

            {renderAiInsights(
              completedProposals.find((p) => p.id === selectedProposal)
                ?.aiInsights || []
            )}

            <div className={styles.teeVerificationSection}>
              <div className={styles.teeVerificationHeader}>
                <ShieldCheck size={18} weight="fill" />
                <h4>TEE Verification Details</h4>
              </div>

              <div className={styles.verificationSteps}>
                <div className={styles.verificationStep}>
                  <div className={styles.verificationIcon}>
                    <LockKey size={16} weight="fill" />
                  </div>
                  <div className={styles.verificationContent}>
                    <span className={styles.verificationTitle}>
                      Encrypted Votes
                    </span>
                    <span className={styles.verificationStatus}>Verified</span>
                  </div>
                </div>

                <ArrowRight size={14} className={styles.verificationArrow} />

                <div className={styles.verificationStep}>
                  <div className={styles.verificationIcon}>
                    <ShieldCheck size={16} weight="fill" />
                  </div>
                  <div className={styles.verificationContent}>
                    <span className={styles.verificationTitle}>
                      TEE Computation
                    </span>
                    <span className={styles.verificationStatus}>Verified</span>
                  </div>
                </div>

                <ArrowRight size={14} className={styles.verificationArrow} />

                <div className={styles.verificationStep}>
                  <div className={styles.verificationIcon}>
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div className={styles.verificationContent}>
                    <span className={styles.verificationTitle}>
                      Results Published
                    </span>
                    <span className={styles.verificationStatus}>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAuctionResults = () => {
    return (
      <div className={styles.resultsSection}>
        <div className={styles.resultsList}>
          {completedAuctions.map((auction) => (
            <div
              key={auction.id}
              className={`${styles.resultCard} ${
                selectedAuction === auction.id ? styles.selectedCard : ""
              }`}
              onClick={() => setSelectedAuction(auction.id)}
            >
              <div className={styles.resultHeader}>
                <span className={styles.resultId}>{auction.id}</span>
                <div className={styles.completedStatus}>
                  <CheckCircle size={14} weight="fill" />
                  Completed
                </div>
              </div>

              <h3 className={styles.resultTitle}>{auction.title}</h3>
              <p className={styles.resultDescription}>{auction.description}</p>

              <div className={styles.auctionResultDetails}>
                <div className={styles.auctionResultDetail}>
                  <span className={styles.detailLabel}>Winning Bid</span>
                  <span className={styles.detailValue}>
                    {auction.winningBid} ETH
                  </span>
                </div>

                <div className={styles.auctionResultDetail}>
                  <span className={styles.detailLabel}>Total Bids</span>
                  <span className={styles.detailValue}>
                    {auction.totalBids}
                  </span>
                </div>

                <div className={styles.auctionResultDetail}>
                  <span className={styles.detailLabel}>Winner</span>
                  <span className={styles.detailValue}>{auction.winner}</span>
                </div>
              </div>

              <div className={styles.resultFooter}>
                {renderStatusBadge(auction.verificationStatus)}

                <div className={styles.dateBadge}>
                  <Calendar size={14} />
                  Completed {auction.completedDate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedAuction && (
          <div className={styles.resultDetails}>
            <div className={styles.detailsHeader}>
              <h3 className={styles.detailsTitle}>
                <Lightning size={18} />
                Auction Details
              </h3>
            </div>

            {renderAiInsights(
              completedAuctions.find((a) => a.id === selectedAuction)
                ?.aiInsights || []
            )}

            <div className={styles.teeVerificationSection}>
              <div className={styles.teeVerificationHeader}>
                <ShieldCheck size={18} weight="fill" />
                <h4>TEE Verification Details</h4>
              </div>

              <div className={styles.verificationSteps}>
                <div className={styles.verificationStep}>
                  <div className={styles.verificationIcon}>
                    <LockKey size={16} weight="fill" />
                  </div>
                  <div className={styles.verificationContent}>
                    <span className={styles.verificationTitle}>
                      Sealed Bids
                    </span>
                    <span className={styles.verificationStatus}>Verified</span>
                  </div>
                </div>

                <ArrowRight size={14} className={styles.verificationArrow} />

                <div className={styles.verificationStep}>
                  <div className={styles.verificationIcon}>
                    <ShieldCheck size={16} weight="fill" />
                  </div>
                  <div className={styles.verificationContent}>
                    <span className={styles.verificationTitle}>
                      TEE Computation
                    </span>
                    <span className={styles.verificationStatus}>Verified</span>
                  </div>
                </div>

                <ArrowRight size={14} className={styles.verificationArrow} />

                <div className={styles.verificationStep}>
                  <div className={styles.verificationIcon}>
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <div className={styles.verificationContent}>
                    <span className={styles.verificationTitle}>
                      Results Published
                    </span>
                    <span className={styles.verificationStatus}>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className={styles.analyticsSection}>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsHeader}>
            <h3 className={styles.analyticsTitle}>
              <ChartPieSlice size={18} />
              Funding Distribution by Category
            </h3>
          </div>

          <div className={styles.pieChartContainer}>
            <div className={styles.pieChart}>
              {fundingDistributionData.map((segment, index) => {
                // Calculate the start and end angles for each segment
                const total = fundingDistributionData.reduce(
                  (sum, data) => sum + data.amount,
                  0
                );
                const angle = (segment.amount / total) * 360;
                const previousSegmentsAngle =
                  (fundingDistributionData
                    .slice(0, index)
                    .reduce((sum, data) => sum + data.amount, 0) /
                    total) *
                  360;

                return (
                  <div
                    key={segment.category}
                    className={styles.pieSegment}
                    style={{
                      backgroundColor: segment.color,
                      transform: `rotate(${previousSegmentsAngle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        angle <= 180 ? "100% 0%" : "100% 0%, 100% 100%"
                      }, ${
                        angle <= 90
                          ? "50% 50%"
                          : angle <= 180
                          ? "100% 100%, 50% 50%"
                          : angle <= 270
                          ? "100% 100%, 0% 100%, 50% 50%"
                          : "100% 100%, 0% 100%, 0% 0%, 50% 50%"
                      })`,
                    }}
                  />
                );
              })}
              <div className={styles.pieChartCenter}>
                <span className={styles.pieChartValue}>{totalFunding}</span>
                <span className={styles.pieChartLabel}>Total ETH</span>
              </div>
            </div>

            <div className={styles.pieChartLegend}>
              {fundingDistributionData.map((segment) => (
                <div key={segment.category} className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className={styles.legendContent}>
                    <span className={styles.legendLabel}>
                      {segment.category}
                    </span>
                    <span className={styles.legendValue}>
                      {segment.amount} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsHeader}>
            <h3 className={styles.analyticsTitle}>
              <ChartBar size={18} />
              Quarterly Funding Trend
            </h3>
          </div>

          <div className={styles.barChartContainer}>
            {quarterlyFundingData.map((quarter) => {
              const maxAmount = Math.max(
                ...quarterlyFundingData.map((d) => d.amount)
              );
              const barHeight = (quarter.amount / maxAmount) * 100;

              return (
                <div key={quarter.quarter} className={styles.barChartColumn}>
                  <div className={styles.barChartBar}>
                    <div
                      className={styles.barChartFill}
                      style={{ height: `${barHeight}%` }}
                    >
                      <span className={styles.barChartValue}>
                        {quarter.amount}
                      </span>
                    </div>
                  </div>
                  <div className={styles.barChartLabel}>{quarter.quarter}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.aiSummaryCard}>
          <div className={styles.aiSummaryHeader}>
            <Brain size={24} weight="fill" />
            <h3 className={styles.aiSummaryTitle}>
              AI-Enhanced Funding Analysis
            </h3>
          </div>

          <div className={styles.aiSummaryContent}>
            <p className={styles.aiSummaryText}>
              Based on historical data and current trends, our AI analysis
              indicates strong growth in funding allocations, with a 44%
              increase from Q1 2024 to Q1 2025. Development and research
              categories continue to receive the largest share of funding (56%),
              aligned with the DAO's technical objectives.
            </p>

            <div className={styles.aiInsights}>
              <div className={styles.aiInsightItem}>
                <div className={styles.aiInsightIcon}>
                  <ChartLine size={18} />
                </div>
                <div className={styles.aiInsightContent}>
                  <h4 className={styles.aiInsightTitle}>Growth Prediction</h4>
                  <p className={styles.aiInsightText}>
                    Projected 30-35% increase in total funding for Q2 2025 based
                    on current proposal pipeline and community engagement
                    metrics.
                  </p>
                </div>
              </div>

              <div className={styles.aiInsightItem}>
                <div className={styles.aiInsightIcon}>
                  <Hash size={18} />
                </div>
                <div className={styles.aiInsightContent}>
                  <h4 className={styles.aiInsightTitle}>Category Trend</h4>
                  <p className={styles.aiInsightText}>
                    Infrastructure funding is growing fastest (+45% QoQ),
                    reflecting increased focus on scalability and
                    interoperability initiatives.
                  </p>
                </div>
              </div>

              <div className={styles.aiInsightItem}>
                <div className={styles.aiInsightIcon}>
                  <Users size={18} />
                </div>
                <div className={styles.aiInsightContent}>
                  <h4 className={styles.aiInsightTitle}>
                    Participation Analysis
                  </h4>
                  <p className={styles.aiInsightText}>
                    Voting participation has increased by 25% since implementing
                    TEE-protected privacy features, suggesting enhanced
                    community trust in the governance process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>Results & Analytics</h2>
        <p className={styles.resultsDescription}>
          View the outcomes of proposal votes and auctions, all verified through
          our TEE network. AI-enhanced analytics provide deeper insights into
          funding trends and governance patterns.
        </p>
      </div>

      <div className={styles.resultsTabs}>
        <button
          className={`${styles.resultsTab} ${
            activeTab === "ai-analysis" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("ai-analysis")}
        >
          <Brain size={18} />
          AI Analysis
        </button>
        <button
          className={`${styles.resultsTab} ${
            activeTab === "proposals" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("proposals")}
        >
          <FileText size={18} />
          Proposal Results
        </button>
        <button
          className={`${styles.resultsTab} ${
            activeTab === "auctions" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("auctions")}
        >
          <Lightning size={18} />
          Auction Results
        </button>
        <button
          className={`${styles.resultsTab} ${
            activeTab === "analytics" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          <ChartPieSlice size={18} />
          Funding Analytics
        </button>
      </div>

      <div className={styles.resultsContent}>
        {activeTab === "ai-analysis" && <AIAnalysis />}
        {activeTab === "proposals" && renderProposalResults()}
        {activeTab === "auctions" && renderAuctionResults()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>

      <div className={styles.teeExplanation}>
        <div className={styles.teeIcon}>
          <ShieldCheck size={24} weight="fill" />
        </div>
        <div className={styles.teeContent}>
          <h3 className={styles.teeTitle}>TEE-Verified Results</h3>
          <p className={styles.teeText}>
            All voting and auction results are processed and verified through
            our network of Trusted Execution Environments (TEEs). This ensures
            complete integrity of the results while preserving the privacy of
            votes and bids.
          </p>
        </div>

        <div className={styles.teeVerifiedBadge}>
          <Eye size={16} />
          <span>View Attestation</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsVisualization;
