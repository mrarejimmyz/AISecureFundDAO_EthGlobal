import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import ProductRegistryABI from "../utils/ProductRegistryABI.json";
import styles from "./ActiveProposals.module.css";
import { CheckCircle, Clock, ArrowRight } from "phosphor-react";

// Contract address for the ProjectRegistry
const PROJECT_REGISTRY_ADDRESS = "0x485641b60be6e9bd662a9cecb58d66874257aa25";

interface Project {
  id: string;
  name: string;
  proposer: string;
  fundingGoal: string;
  isActive: boolean;
}

const ActiveProposals: React.FC = () => {
  const { provider } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!provider) return;

      try {
        setLoading(true);
        setError(null);

        // Create contract instance
        const contract = new ethers.Contract(
          PROJECT_REGISTRY_ADDRESS,
          ProductRegistryABI,
          provider
        );

        // Get the total count of projects
        const count = await contract.projectCount();

        // Create an array to store project promises
        const projectPromises = [];

        // Iterate from 1 to count (assuming IDs start at 1)
        for (let i = 1; i <= count; i++) {
          projectPromises.push(contract.projects(i));
        }

        // Fetch all projects
        const projectResults = await Promise.all(projectPromises);

        // Format the projects for display
        const formattedProjects = projectResults.map((project) => ({
          id: project.id.toString(),
          name: project.name,
          proposer: project.proposer,
          fundingGoal: ethers.formatEther(project.fundingGoal),
          isActive: project.isActive,
        }));

        setProjects(formattedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [provider]);

  // Format deadline (simulate a deadline for display purposes)
  const formatDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Set deadline 7 days from now
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.proposalsContainer}>
      <h2 className={styles.proposalsTitle}>Project Proposals</h2>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading proposals...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className={styles.emptyState}>
          <p>No proposals found. Be the first to submit a project!</p>
        </div>
      )}

      <div className={styles.proposalsList}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={`${styles.proposalCard} ${
              project.isActive ? styles.activeProposal : styles.inactiveProposal
            }`}
          >
            <div className={styles.proposalHeader}>
              <span className={styles.proposalId}>#{project.id}</span>
              <span
                className={`${styles.statusBadge} ${
                  project.isActive ? styles.statusActive : styles.statusEnded
                }`}
              >
                {project.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <h3 className={styles.proposalTitle}>{project.name}</h3>
            <p className={styles.proposalDescription}>
              Funding Goal: {project.fundingGoal} ETH
              <br />
              Proposer: {project.proposer.substring(0, 6)}...
              {project.proposer.substring(project.proposer.length - 4)}
            </p>

            <div className={styles.proposalDetails}>
              <div className={styles.proposalDetail}>
                <Clock size={16} />
                <div>
                  <span className={styles.detailLabel}>Deadline</span>
                  <span className={styles.detailValue}>{formatDeadline()}</span>
                </div>
              </div>

              {project.isActive && (
                <div className={styles.proposalDetail}>
                  <Clock size={16} />
                  <div>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={styles.detailValue}>Ready for voting</span>
                  </div>
                </div>
              )}
            </div>

            {project.isActive && (
              <button
                className={styles.voteButton}
                onClick={() => (window.location.href = "#/voting")}
              >
                <CheckCircle size={18} />
                Cast Vote
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveProposals;
