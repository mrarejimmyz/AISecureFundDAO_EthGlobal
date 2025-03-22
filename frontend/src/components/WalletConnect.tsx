import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatAddress, getChainName } from '../utils/web3';
import styles from './WalletConnect.module.css';
import { 
  Wallet, 
  CaretDown, 
  SignOut, 
  Copy, 
  GlobeHemisphereEast,
  ArrowsClockwise,
  CheckCircle
} from 'phosphor-react';

const WalletConnect: React.FC = () => {
  const { connect, disconnect, isActive, account, chainId, isConnecting } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.walletContainer} ref={dropdownRef}>
      {!isActive ? (
        <button 
          className={styles.connectButton}
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <ArrowsClockwise size={18} weight="bold" className={styles.spinningIcon} />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={18} weight="bold" />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <>
          <button className={styles.walletButton} onClick={toggleDropdown}>
            <Wallet size={18} weight="bold" />
            {formatAddress(account || '')}
            <CaretDown size={14} weight="bold" className={showDropdown ? styles.caretUp : ''} />
          </button>
          
          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.walletHeader}>
                <div className={styles.addressContainer}>
                  <span className={styles.walletAddress}>{account}</span>
                  <button className={styles.copyButton} onClick={copyAddress}>
                    {copied ? <CheckCircle size={16} weight="fill" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className={styles.textCenter}>
                  <span className={styles.networkBadge}>
                    <GlobeHemisphereEast size={14} weight="bold" />
                    {chainId ? getChainName(chainId) : 'Unknown Network'}
                  </span>
                </div>
              </div>
              
              <div className={styles.balanceSection}>
                <div className={styles.balanceItem}>
                  <span className={styles.balanceLabel}>Balance</span>
                  <span className={styles.balanceValue}>0.00 ETH</span>
                </div>
              </div>
              
              <div 
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={disconnect}
              >
                <SignOut size={18} weight="bold" />
                Disconnect
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletConnect;