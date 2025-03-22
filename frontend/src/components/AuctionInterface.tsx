import React, { useState } from 'react';
import { 
  Lightning, 
  Clock, 
  Users, 
  LockKey, 
  CurrencyEth, 
  ShieldCheck, 
  CheckCircle,
  ArrowRight,
  Info,
  Calendar,
  Timer
} from 'phosphor-react';
import { useWallet } from '../context/WalletContext';
import styles from './AuctionInterface.module.css';

// Mock auction data
const auctionData = [
  {
    id: 'AUC-001',
    title: 'Privacy Research Grant',
    description: 'Support cutting-edge research into zero-knowledge proofs and their applications in decentralized voting systems.',
    currentBid: '180',
    minBid: '185',
    bidders: 8,
    startDate: '2025-03-10',
    endDate: '2025-03-25',
    status: 'active',
    bidHistory: [
      { time: '2025-03-21T14:32:19Z', event: 'New bid placed' },
      { time: '2025-03-19T09:12:45Z', event: 'New bid placed' },
      { time: '2025-03-17T22:05:33Z', event: 'New bid placed' }
    ]
  },
  {
    id: 'AUC-002',
    title: 'Zero-Knowledge Infrastructure',
    description: 'Fund the development of infrastructure components that enable private, secure interactions on Ethereum using zero-knowledge technology.',
    currentBid: '250',
    minBid: '255',
    bidders: 12,
    startDate: '2025-03-15',
    endDate: '2025-03-30',
    status: 'active',
    bidHistory: [
      { time: '2025-03-22T10:45:12Z', event: 'New bid placed' },
      { time: '2025-03-21T18:37:29Z', event: 'New bid placed' },
      { time: '2025-03-20T07:14:55Z', event: 'New bid placed' },
      { time: '2025-03-18T15:21:08Z', event: 'New bid placed' }
    ]
  },
  {
    id: 'AUC-003',
    title: 'Community Education Fund',
    description: 'Support educational initiatives focused on privacy-preserving technologies, TEEs, and secure multi-party computation within the community.',
    currentBid: '120',
    minBid: '125',
    bidders: 5,
    startDate: '2025-03-08',
    endDate: '2025-03-23',
    status: 'active',
    bidHistory: [
      { time: '2025-03-22T09:22:47Z', event: 'New bid placed' },
      { time: '2025-03-19T11:33:28Z', event: 'New bid placed' }
    ]
  },
  {
    id: 'AUC-004',
    title: 'DAO Governance Tooling',
    description: 'Fund the development of advanced governance tools leveraging TEEs to improve decision-making in DAOs through anonymous voting and preference aggregation.',
    currentBid: '150',
    minBid: '155',
    bidders: 7,
    startDate: '2025-03-05',
    endDate: '2025-03-20',
    status: 'ended',
    winner: '0xa1b2...c3d4',
    finalBid: '320',
    bidHistory: [
      { time: '2025-03-20T23:59:59Z', event: 'Auction ended' },
      { time: '2025-03-20T22:12:34Z', event: 'New bid placed' },
      { time: '2025-03-19T14:21:03Z', event: 'New bid placed' }
    ]
  }
];

const AuctionInterface: React.FC = () => {
  const { isActive } = useWallet();
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBidSuccess, setShowBidSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');
  const [showEncryptionProcess, setShowEncryptionProcess] = useState(false);

  const calculateTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const difference = end.getTime() - now.getTime();
    
    if (difference <= 0) {
      return 'Ended';
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h remaining`;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(timeString).toLocaleDateString(undefined, options);
  };

  const handleBidSubmit = async (auctionId: string) => {
    if (!isActive) {
      alert('Please connect your wallet to place a bid');
      return;
    }
    
    if (!bidAmount.trim() || isNaN(parseFloat(bidAmount))) {
      alert('Please enter a valid bid amount');
      return;
    }
    
    const auction = auctionData.find(a => a.id === auctionId);
    if (!auction) return;
    
    const minBidAmount = parseFloat(auction.minBid);
    const userBidAmount = parseFloat(bidAmount);
    
    if (userBidAmount < minBidAmount) {
      alert(`Bid must be at least ${minBidAmount} ETH`);
      return;
    }
    
    setIsSubmitting(true);
    setShowEncryptionProcess(true);
    
    // Simulate processing time for encryption and TEE
    setTimeout(() => {
      setIsSubmitting(false);
      setShowEncryptionProcess(false);
      setShowBidSuccess(true);
      setBidAmount('');
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowBidSuccess(false);
      }, 5000);
    }, 3000);
  };

  const filteredAuctions = auctionData.filter(auction => 
    activeTab === 'ongoing' ? auction.status === 'active' : auction.status === 'ended'
  );

  const renderAuctionList = () => {
    if (filteredAuctions.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Info size={32} />
          <p>No {activeTab === 'ongoing' ? 'active' : 'ended'} auctions found</p>
        </div>
      );
    }

    return filteredAuctions.map(auction => (
      <div 
        key={auction.id}
        className={`${styles.auctionCard} ${selectedAuction === auction.id ? styles.selectedAuction : ''}`}
        onClick={() => setSelectedAuction(auction.id)}
      >
        <div className={styles.auctionHeader}>
          <span className={styles.auctionId}>{auction.id}</span>
          <div className={styles.auctionStatus}>
            {auction.status === 'active' ? (
              <>
                <span className={styles.statusDot}></span>
                Active
              </>
            ) : (
              <>
                <CheckCircle size={12} />
                Completed
              </>
            )}
          </div>
        </div>
        
        <h3 className={styles.auctionTitle}>{auction.title}</h3>
        <p className={styles.auctionDescription}>{auction.description}</p>
        
        <div className={styles.auctionDetails}>
          <div className={styles.auctionDetail}>
            <CurrencyEth size={16} />
            <div>
              <span className={styles.detailLabel}>
                {auction.status === 'active' ? 'Current Bid' : 'Final Bid'}
              </span>
              <span className={styles.detailValue}>
                {auction.status === 'active' ? auction.currentBid : auction.finalBid} ETH
              </span>
            </div>
          </div>
          
          <div className={styles.auctionDetail}>
            <Users size={16} />
            <div>
              <span className={styles.detailLabel}>Bidders</span>
              <span className={styles.detailValue}>{auction.bidders}</span>
            </div>
          </div>
          
          <div className={styles.auctionDetail}>
            <Clock size={16} />
            <div>
              <span className={styles.detailLabel}>
                {auction.status === 'active' ? 'Time Left' : 'Ended On'}
              </span>
              <span className={styles.detailValue}>
                {auction.status === 'active' 
                  ? calculateTimeLeft(auction.endDate)
                  : formatDate(auction.endDate)
                }
              </span>
            </div>
          </div>
        </div>
        
        {auction.status === 'active' && selectedAuction === auction.id && (
          <div className={styles.bidSection}>
            <div className={styles.bidInputGroup}>
              <div className={styles.bidInputContainer}>
                <input
                  type="text"
                  className={styles.bidInput}
                  placeholder={`Min bid: ${auction.minBid} ETH`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={isSubmitting}
                />
                <div className={styles.bidInputSuffix}>ETH</div>
              </div>
              <button
                className={styles.bidButton}
                onClick={() => handleBidSubmit(auction.id)}
                disabled={isSubmitting || !isActive}
              >
                {isSubmitting ? 'Processing...' : 'Place Sealed Bid'}
              </button>
            </div>
            
            {showEncryptionProcess && selectedAuction === auction.id && (
              <div className={styles.encryptionProcess}>
                <div className={styles.encryptionSteps}>
                  <div className={`${styles.encryptionStep} ${styles.active}`}>
                    <LockKey size={18} className={styles.encryptionIcon} />
                    <span>Encrypting Bid</span>
                  </div>
                  <ArrowRight size={14} className={styles.arrowIcon} />
                  <div className={`${styles.encryptionStep} ${styles.active}`}>
                    <ShieldCheck size={18} className={styles.encryptionIcon} />
                    <span>TEE Processing</span>
                  </div>
                  <ArrowRight size={14} className={styles.arrowIcon} />
                  <div className={styles.encryptionStep}>
                    <CheckCircle size={18} className={styles.encryptionIcon} />
                    <span>Bid Registered</span>
                  </div>
                </div>
                <div className={styles.teeIndicator}>
                  <ShieldCheck size={16} />
                  <span>Bid being processed in Trusted Execution Environment</span>
                </div>
              </div>
            )}
            
            {showBidSuccess && selectedAuction === auction.id && (
              <div className={styles.successMessage}>
                <CheckCircle size={18} weight="fill" />
                <span>Your sealed bid has been submitted successfully!</span>
              </div>
            )}
          </div>
        )}
        
        {auction.status === 'ended' && selectedAuction === auction.id && (
          <div className={styles.auctionResult}>
            <div className={styles.winnerInfo}>
              <span className={styles.winnerLabel}>Winner:</span>
              <span className={styles.winnerAddress}>{auction.winner}</span>
            </div>
          </div>
        )}
      </div>
    ));
  };

  const renderAuctionDetails = () => {
    const auction = auctionData.find(a => a.id === selectedAuction);
    if (!auction) return null;

    return (
      <div className={styles.auctionDetails}>
        <div className={styles.detailsHeader}>
          <h3 className={styles.detailsTitle}>Auction Details</h3>
        </div>
        
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <div className={styles.detailItemIcon}>
              <Calendar size={16} />
            </div>
            <div className={styles.detailItemContent}>
              <span className={styles.detailItemLabel}>Start Date</span>
              <span className={styles.detailItemValue}>{formatDate(auction.startDate)}</span>
            </div>
          </div>
          
          <div className={styles.detailItem}>
            <div className={styles.detailItemIcon}>
              <Calendar size={16} />
            </div>
            <div className={styles.detailItemContent}>
              <span className={styles.detailItemLabel}>End Date</span>
              <span className={styles.detailItemValue}>{formatDate(auction.endDate)}</span>
            </div>
          </div>
          
          <div className={styles.detailItem}>
            <div className={styles.detailItemIcon}>
              <CurrencyEth size={16} />
            </div>
            <div className={styles.detailItemContent}>
              <span className={styles.detailItemLabel}>Starting Bid</span>
              <span className={styles.detailItemValue}>{auction.minBid} ETH</span>
            </div>
          </div>
          
          <div className={styles.detailItem}>
            <div className={styles.detailItemIcon}>
              <Users size={16} />
            </div>
            <div className={styles.detailItemContent}>
              <span className={styles.detailItemLabel}>Total Bidders</span>
              <span className={styles.detailItemValue}>{auction.bidders}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.bidHistorySection}>
          <h4 className={styles.bidHistoryTitle}>
            <Timer size={16} />
            Bid History
          </h4>
          <div className={styles.bidHistoryList}>
            {auction.bidHistory.map((entry, index) => (
              <div key={index} className={styles.bidHistoryItem}>
                <div className={styles.bidHistoryTime}>
                  {formatTime(entry.time)}
                </div>
                <div className={styles.bidHistoryEvent}>
                  {entry.event}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.auctionContainer}>
      <div className={styles.auctionHeader}>
        <h2 className={styles.auctionTitle}>Sealed-Bid Auctions</h2>
        <p className={styles.auctionDescription}>
          Submit confidential bids for projects. All bids are encrypted and processed through
          Trusted Execution Environments (TEEs) to ensure privacy and prevent front-running.
        </p>
      </div>
      
      {!isActive && (
        <div className={styles.walletWarning}>
          <Info size={24} />
          <p>Please connect your wallet to participate in auctions</p>
        </div>
      )}
      
      <div className={styles.auctionTabs}>
        <button
          className={`${styles.auctionTab} ${activeTab === 'ongoing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ongoing')}
        >
          <Lightning size={18} />
          Active Auctions
        </button>
        <button
          className={`${styles.auctionTab} ${activeTab === 'ended' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ended')}
        >
          <CheckCircle size={18} />
          Completed Auctions
        </button>
      </div>
      
      <div className={styles.auctionContent}>
        <div className={styles.auctionList}>
          {renderAuctionList()}
        </div>
        
        {selectedAuction && (
          <div className={styles.auctionDetailsPanel}>
            {renderAuctionDetails()}
          </div>
        )}
      </div>
      
      <div className={styles.teeExplanation}>
        <div className={styles.teeIcon}>
          <LockKey size={24} weight="fill" />
        </div>
        <div className={styles.teeContent}>
          <h3 className={styles.teeTitle}>Privacy-Protected Bidding</h3>
          <p className={styles.teeText}>
            All bids are encrypted and processed in Trusted Execution Environments (TEEs).
            This ensures that bid amounts remain confidential until the auction ends, 
            preventing manipulation and front-running.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuctionInterface;