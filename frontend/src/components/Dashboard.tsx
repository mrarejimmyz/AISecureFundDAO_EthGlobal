import React from 'react';
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
  Stack
} from 'phosphor-react';
import styles from './Dashboard.module.css';

// Mock data for active proposals
const activeProposals = [
  {
    id: 'PROP-001',
    title: 'Fund AI Research Project',
    description: 'Allocate 500 ETH to research privacy-preserving AI algorithms for decentralized voting systems.',
    votes: 32,
    deadline: '2025-04-15',
    status: 'active'
  },
  {
    id: 'PROP-002',
    title: 'Add New Governance Features',
    description: 'Implement quadratic voting and commit-reveal schemes to enhance the DAO governance system.',
    votes: 27,
    deadline: '2025-04-20',
    status: 'active'
  }
];

// Mock data for active auctions
const activeAuctions = [
  {
    id: 'AUC-001',
    title: 'Privacy Research Grant',
    currentBid: '180 ETH',
    bidders: 8,
    endsIn: '2d 14h',
    status: 'active'
  },
  {
    id: 'AUC-002',
    title: 'Zero-Knowledge Infrastructure',
    currentBid: '250 ETH',
    bidders: 12,
    endsIn: '4d 6h',
    status: 'active'
  },
  {
    id: 'AUC-003',
    title: 'Community Education Fund',
    currentBid: '120 ETH',
    bidders: 5,
    endsIn: '1d 8h',
    status: 'active'
  }
];

// Sponsor technologies
const sponsors = [
  {
    id: 'marlin',
    name: 'Marlin TEEs',
    description: 'Secure computation',
    icon: <ShieldCheck size={20} weight="fill" />,
    color: '#4f46e5'
  },
  {
    id: 'nethermind',
    name: 'Nethermind',
    description: 'Agentic AI capabilities',
    icon: <Robot size={20} weight="fill" />,
    color: '#ec4899'
  },
  {
    id: 'nillion',
    name: 'Nillion',
    description: 'Privacy-preserving AI',
    icon: <LockKey size={20} weight="fill" />,
    color: '#10b981'
  },
  {
    id: 't1',
    name: 't1 Protocol',
    description: 'Real-time proving',
    icon: <Lightning size={20} weight="fill" />,
    color: '#f59e0b'
  },
  {
    id: 'autonome',
    name: 'Autonome',
    description: 'AI agent development',
    icon: <Lightbulb size={20} weight="fill" />,
    color: '#6366f1'
  },
  {
    id: '0g',
    name: '0G',
    description: 'Decentralized storage',
    icon: <Database size={20} weight="fill" />,
    color: '#8b5cf6'
  },
  {
    id: 'coinbase',
    name: 'Coinbase AgentKit',
    description: 'Wallet management',
    icon: <PlugsConnected size={20} weight="fill" />,
    color: '#3b82f6'
  }
];

// Stats data
const statsData = [
  {
    label: 'Total Proposals',
    value: '24',
    icon: <FileText size={24} weight="fill" />,
    color: '#3b82f6'
  },
  {
    label: 'Total Funds Allocated',
    value: '2,450 ETH',
    icon: <Stack size={24} weight="fill" />,
    color: '#10b981'
  },
  {
    label: 'Active Members',
    value: '357',
    icon: <Users size={24} weight="fill" />,
    color: '#8b5cf6'
  },
  {
    label: 'Completed Projects',
    value: '18',
    icon: <ChartPieSlice size={24} weight="fill" />,
    color: '#f59e0b'
  }
];

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
        <div className={styles.statsGrid}>
          {statsData.map((stat) => (
            <div key={stat.label} className={styles.statCard} style={{ borderColor: stat.color }}>
              <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
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
            {activeProposals.map((proposal) => (
              <div key={proposal.id} className={styles.proposalCard}>
                <div className={styles.proposalHeader}>
                  <span className={styles.proposalId}>{proposal.id}</span>
                  <span className={styles.proposalStatus}>
                    <span className={styles.statusDot}></span>
                    Active
                  </span>
                </div>
                <h3 className={styles.proposalTitle}>{proposal.title}</h3>
                <p className={styles.proposalDescription}>{proposal.description}</p>
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
            ))}
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
                    <span className={styles.detailValue}>{auction.currentBid}</span>
                  </div>
                  <div className={styles.auctionDetail}>
                    <span className={styles.detailLabel}>Bidders</span>
                    <span className={styles.detailValue}>{auction.bidders}</span>
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
              <div className={styles.sponsorIcon} style={{ backgroundColor: `${sponsor.color}15`, color: sponsor.color }}>
                {sponsor.icon}
              </div>
              <div className={styles.sponsorInfo}>
                <h3 className={styles.sponsorName}>{sponsor.name}</h3>
                <p className={styles.sponsorDescription}>{sponsor.description}</p>
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
            All voting and auction data is processed in Trusted Execution Environments (TEEs)
            to ensure privacy and security. Current network status is operational with
            7 active nodes.
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