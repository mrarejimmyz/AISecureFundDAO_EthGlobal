import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  ChartPieSlice,
  Users,
  LockKey,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  Clock,
  Database,
  Lightning,
  Robot,
  FileText,
  PlugsConnected,
  Stack,
} from "phosphor-react";
import styles from "./Dashboard.module.css";
import { useWallet } from "../context/WalletContext";
import PrivateVotingABI from "../utils/PrivateVotingABI.json";

// Replace with your deployed PrivateVoting contract address
const PRIVATE_VOTING_ADDRESS = "0x32cb351c8562cb896ffbe7cc3bbc7ccebbcb2afb";

interface Proposal {
  id: string;
  title: string;
  description: string;
  votes: number;
  deadline: string;
  status: string;
  endTime: number;
}

const Dashboard: React.FC = () => {
  const { provider } = useWallet();
  const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveProposals = async () => {
      if (!provider) return;

      try {
        const contract = new ethers.Contract(
          PRIVATE_VOTING_ADDRESS,
          PrivateVotingABI,
          provider
        );
        // Get all ProposalCreated events
        const filter = contract.filters.ProposalCreated();
        const events = await contract.queryFilter(filter);
        const currentTime = Math.floor(Date.now() / 1000);

        // Process each event to fetch proposal details
        const proposals: (Proposal | null)[] = await Promise.all(
          events.map(async (event: any) => {
            // Get the projectId from event arguments
            const projectId = event.args[0];
            // Fetch proposal details from the contract
            const details = await contract.getProposalDetails(projectId);
            // Expected details: [startTime, endTime, finalized, approved?]
            const [, endTime, finalized] = details;
            // Convert endTime to a number regardless of its type
            const endTimeNumber =
              typeof endTime === "object" &&
              typeof endTime.toNumber === "function"
                ? endTime.toNumber()
                : Number(endTime);
            // Only include proposals that are not finalized and still active
            if (!finalized && endTimeNumber > currentTime) {
              const deadlineDate = new Date(endTimeNumber * 1000);
              const formattedDeadline = deadlineDate.toLocaleDateString();
              return {
                id: `PROP-${projectId.toString().padStart(3, "0")}`,
                title: `Proposal #${projectId.toString()}`,
                description: "Proposal description placeholder.",
                votes: 0, // Update this with the actual vote count if available
                deadline: formattedDeadline,
                status: "active",
                endTime: endTimeNumber,
              };
            }
            return null;
          })
        );

        const filteredProposals = proposals.filter(
          (p): p is Proposal => p !== null
        );
        setActiveProposals(filteredProposals);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setIsLoading(false);
      }
    };

    fetchActiveProposals();
  }, [provider]);

  // Static mock data for active auctions
  const activeAuctions = [
    {
      id: "AUC-001",
      title: "Privacy Research Grant",
      currentBid: "180 ETH",
      bidders: 8,
      endsIn: "2d 14h",
      status: "active",
    },
    {
      id: "AUC-002",
      title: "Zero-Knowledge Infrastructure",
      currentBid: "250 ETH",
      bidders: 12,
      endsIn: "4d 6h",
      status: "active",
    },
    {
      id: "AUC-003",
      title: "Community Education Fund",
      currentBid: "120 ETH",
      bidders: 5,
      endsIn: "1d 8h",
      status: "active",
    },
  ];

  // Static data for sponsors
  const sponsors = [
    {
      id: "marlin",
      name: "Marlin TEEs",
      description: "Secure computation",
      icon: <ShieldCheck size={20} weight="fill" />,
      color: "#4f46e5",
    },
    {
      id: "nethermind",
      name: "Nethermind",
      description: "Agentic AI capabilities",
      icon: <Robot size={20} weight="fill" />,
      color: "#ec4899",
    },
    {
      id: "nillion",
      name: "Nillion",
      description: "Privacy-preserving AI",
      icon: <LockKey size={20} weight="fill" />,
      color: "#10b981",
    },
    {
      id: "t1",
      name: "t1 Protocol",
      description: "Real-time proving",
      icon: <Lightning size={20} weight="fill" />,
      color: "#f59e0b",
    },
    {
      id: "autonome",
      name: "Autonome",
      description: "AI agent development",
      icon: <Lightbulb size={20} weight="fill" />,
      color: "#6366f1",
    },
    {
      id: "0g",
      name: "0G",
      description: "Decentralized storage",
      icon: <Database size={20} weight="fill" />,
      color: "#8b5cf6",
    },
    {
      id: "coinbase",
      name: "Coinbase AgentKit",
      description: "Wallet management",
      icon: <PlugsConnected size={20} weight="fill" />,
      color: "#3b82f6",
    },
  ];

  // Static data for stats
  const statsData = [
    {
      label: "Total Proposals",
      value: "24",
      icon: <FileText size={24} weight="fill" />,
      color: "#3b82f6",
    },
    {
      label: "Total Funds Allocated",
      value: "2,450 ETH",
      icon: <Stack size={24} weight="fill" />,
      color: "#10b981",
    },
    {
      label: "Active Members",
      value: "357",
      icon: <Users size={24} weight="fill" />,
      color: "#8b5cf6",
    },
    {
      label: "Completed Projects",
      value: "18",
      icon: <ChartPieSlice size={24} weight="fill" />,
      color: "#f59e0b",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
        <div className={styles.statsGrid}>
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className={styles.statCard}
              style={{ borderColor: stat.color }}
            >
              <div
                className={styles.statIcon}
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.columnsContainer}>
        <section className={styles.proposalsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Proposals</h2>
            <button className={styles.viewAllButton}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.proposalsList}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading proposals...</p>
              </div>
            ) : activeProposals.length === 0 ? (
              <div className={styles.emptyState}>
                <p>
                  No active proposals found. Be the first to submit a project!
                </p>
              </div>
            ) : (
              activeProposals.map((proposal) => (
                <div key={proposal.id} className={styles.proposalCard}>
                  <div className={styles.proposalHeader}>
                    <span className={styles.proposalId}>{proposal.id}</span>
                    <span className={styles.proposalStatus}>
                      <span className={styles.statusDot}></span>
                      Active
                    </span>
                  </div>
                  <h3 className={styles.proposalTitle}>{proposal.title}</h3>
                  <p className={styles.proposalDescription}>
                    {proposal.description}
                  </p>
                  <div className={styles.proposalFooter}>
                    <div className={styles.proposalStat}>
                      <Users size={14} />
                      <span>{proposal.votes} votes</span>
                    </div>
                    <div className={styles.proposalStat}>
                      <Clock size={14} />
                      <span>Ends {proposal.deadline}</span>
                    </div>
                  </div>
                  <button className={styles.proposalButton}>Cast Vote</button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className={styles.auctionsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Auctions</h2>
            <button className={styles.viewAllButton}>
              View All <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.auctionsList}>
            {activeAuctions.map((auction) => (
              <div key={auction.id} className={styles.auctionCard}>
                <div className={styles.auctionHeader}>
                  <span className={styles.auctionId}>{auction.id}</span>
                  <span className={styles.auctionStatus}>
                    <span className={styles.statusDot}></span>
                    {auction.status}
                  </span>
                </div>
                <h3 className={styles.auctionTitle}>{auction.title}</h3>
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Current Bid</span>
                    <span className={styles.detailValue}>
                      {auction.currentBid}
                    </span>
                  </div>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Bidders</span>
                    <span className={styles.detailValue}>
                      {auction.bidders}
                    </span>
                  </div>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Ends In</span>
                    <span className={styles.detailValue}>{auction.endsIn}</span>
                  </div>
                </div>
                <button className={styles.auctionButton}>Place Bid</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.sponsorsSection}>
        <h2 className={styles.sectionTitle}>Powered By</h2>
        <div className={styles.sponsorsGrid}>
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className={styles.sponsorCard}>
              <div
                className={styles.sponsorIcon}
                style={{
                  backgroundColor: `${sponsor.color}15`,
                  color: sponsor.color,
                }}
              >
                {sponsor.icon}
              </div>
              <div className={styles.sponsorInfo}>
                <h3 className={styles.sponsorName}>{sponsor.name}</h3>
                <p className={styles.sponsorDescription}>
                  {sponsor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.teeSection}>
        <div className={styles.teeVisual}>
          <ShieldCheck size={32} weight="fill" className={styles.teeIcon} />
        </div>
        <div className={styles.teeContent}>
          <h2 className={styles.teeTitle}>TEE Network Status</h2>
          <p className={styles.teeDescription}>
            All voting and auction data is processed in Trusted Execution
            Environments (TEEs) to ensure privacy and security. Current network
            status is operational with 7 active nodes.
          </p>
          <div className={styles.teeStatus}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDotActive}></span>
              <span>Active</span>
            </div>
            <div className={styles.statusDetail}>
              <span>Last verification: 5 minutes ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
