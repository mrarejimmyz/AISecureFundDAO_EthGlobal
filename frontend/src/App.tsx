/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import {
  ShieldCheck,
  ChartPieSlice,
  Users,
  FileText,
  Lightning,
  CheckCircle,
  LockKey,
} from "phosphor-react";
import WalletConnect from "./components/WalletConnect";
import VotingInterface from "./components/VotingInterface";
import Dashboard from "./components/Dashboard";
import ProjectSubmission from "./components/ProjectSubmission";
import AuctionInterface from "./components/AuctionInterface";
import ResultsVisualization from "./components/ResultsVisualization";
import PrivacyVisualization from "./components/PrivacyVisualization";
import styles from "./App.module.css";

function App() {
  const [activeNav, setActiveNav] = useState("home");

  const renderContent = () => {
    switch (activeNav) {
      case "voting":
        return <VotingInterface />;
      case "auctions":
        return <AuctionInterface />;
      case "results":
        return <ResultsVisualization />;
      case "submit":
        return <ProjectSubmission />;
      case "privacy": // Add this new case
        return <PrivacyVisualization />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <ShieldCheck size={32} weight="fill" className={styles.logoIcon} />
            <h1 className={styles.logoText}>AISecureFundDAO</h1>
          </div>

          <div className={styles.navContainer}>
            <a
              className={`${styles.navLink} ${
                activeNav === "home" ? styles.navLinkActive : ""
              }`}
              onClick={() => setActiveNav("home")}
            >
              <Users size={18} />
              Home
            </a>
            <a
              className={`${styles.navLink} ${
                activeNav === "voting" ? styles.navLinkActive : ""
              }`}
              onClick={() => setActiveNav("voting")}
            >
              <CheckCircle size={18} />
              Voting
            </a>
            <a
              className={`${styles.navLink} ${
                activeNav === "auctions" ? styles.navLinkActive : ""
              }`}
              onClick={() => setActiveNav("auctions")}
            >
              <Lightning size={18} />
              Auctions
            </a>
            <a
              className={`${styles.navLink} ${
                activeNav === "results" ? styles.navLinkActive : ""
              }`}
              onClick={() => setActiveNav("results")}
            >
              <ChartPieSlice size={18} />
              Results
            </a>
            <a
              className={`${styles.navLink} ${
                activeNav === "submit" ? styles.navLinkActive : ""
              }`}
              onClick={() => setActiveNav("submit")}
            >
              <FileText size={18} />
              Submit
            </a>
            <a
              className={`${styles.navLink} ${
                activeNav === "privacy" ? styles.navLinkActive : ""
              }`}
              onClick={() => setActiveNav("privacy")}
            >
              <LockKey size={18} />
              Privacy
            </a>
          </div>

          <WalletConnect />
        </header>

        <main className={styles.main}>{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
