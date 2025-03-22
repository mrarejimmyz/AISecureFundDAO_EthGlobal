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
  CheckCircle,
  PlugsConnected
} from 'phosphor-react';

const WalletConnect: React.FC = () => {
  const { 
    connect, 
    connectWithCoinbase, 
    disconnect, 
    isActive, 
    account, 
    chainId, 
    isConnecting, 
    balance,
    walletType
  } = useWallet();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectOptions, setShowConnectOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const connectOptionsRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleConnectOptions = () => {
    setShowConnectOptions(!showConnectOptions);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectMetamask = () => {
    connect();
    setShowConnectOptions(false);
  };

  const handleConnectCoinbase = () => {
    connectWithCoinbase();
    setShowConnectOptions(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      
      if (connectOptionsRef.current && !connectOptionsRef.current.contains(event.target as Node)) {
        setShowConnectOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Display wallet type icon
  const getWalletIcon = () => {
    if (walletType === 'coinbase') {
      return <PlugsConnected size={18} weight="bold" />;
    }
    return <Wallet size={18} weight="bold" />;
  };

  return (
    <div className={styles.walletContainer}>
      {!isActive ? (
        <div ref={connectOptionsRef} className={styles.connectOptionsContainer}>
          <button 
            className={styles.connectButton}
            onClick={toggleConnectOptions}
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
                <CaretDown size={14} weight="bold" className={showConnectOptions ? styles.caretUp : ''} />
              </>
            )}
          </button>
          
          {showConnectOptions && (
            <div className={styles.connectOptions}>
              <div 
                className={styles.connectOption}
                onClick={handleConnectMetamask}
              >
                <Wallet size={18} weight="bold" />
                <span>MetaMask / Injected</span>
              </div>
              <div 
                className={styles.connectOption}
                onClick={handleConnectCoinbase}
              >
                <PlugsConnected size={18} weight="bold" />
                <span>Coinbase AgentKit</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div ref={dropdownRef} className={styles.connectedContainer}>
          <button className={styles.walletButton} onClick={toggleDropdown}>
            {getWalletIcon()}
            {formatAddress(account || '')}
            <CaretDown size={14} weight="bold" className={showDropdown ? styles.caretUp : ''} />
          </button>
          
          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.walletHeader}>
                <div className={styles.walletType}>
                  {walletType === 'coinbase' ? 'Coinbase AgentKit' : 'MetaMask / Injected'}
                </div>
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
                  <span className={styles.balanceValue}>
                    {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.00 ETH'}
                  </span>
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
        </div>
      )}
    </div>
  );
};

export default WalletConnect;