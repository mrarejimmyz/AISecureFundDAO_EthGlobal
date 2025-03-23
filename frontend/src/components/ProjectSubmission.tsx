import React, { useState, useRef } from "react";
import {
  FileText,
  Hash,
  CurrencyEth,
  Calendar,
  CheckCircle,
  X,
  Info,
  ArrowUp,
  LockKey,
  ShieldCheck,
  ArrowRight,
} from "phosphor-react";
import { useWallet } from "../context/WalletContext";
import styles from "./ProjectSubmission.module.css";
import { ethers } from "ethers";

// Import the ABI
const ProductRegistryABI = [
  {
    inputs: [],
    name: "projectCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "projects",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "address",
        name: "proposer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fundingGoal",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "fundingGoal",
        type: "uint256",
      },
    ],
    name: "submitProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface FormData {
  title: string;
  description: string;
  fundingAmount: string;
  timeline: string;
  category: string;
  tags: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  fundingAmount?: string;
  timeline?: string;
  category?: string;
}

// Contract address for the ProjectRegistry
const PROJECT_REGISTRY_ADDRESS = "0x485641b60be6e9bd662a9cecb58d66874257aa25";

const ProjectSubmission: React.FC = () => {
  const { isActive, provider, chainId } = useWallet();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    fundingAmount: "",
    timeline: "",
    category: "research",
    tags: [],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tag, setTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const categories = [
    { id: "research", name: "Research" },
    { id: "development", name: "Development" },
    { id: "community", name: "Community" },
    { id: "infrastructure", name: "Infrastructure" },
    { id: "education", name: "Education" },
  ];

  // Helper function to get the transaction explorer URL based on chainId
  const getExplorerUrl = (txHash: string, chainId?: number) => {
    // Default to a generic blockscan explorer
    let baseUrl = "https://sepolia.arbiscan.io/tx/";

    if (chainId) {
      switch (chainId) {
        case 1: // Ethereum Mainnet
          baseUrl = "https://etherscan.io/tx/";
          break;
        case 5: // Goerli
          baseUrl = "https://goerli.etherscan.io/tx/";
          break;
        case 11155111: // Sepolia
          baseUrl = "https://sepolia.etherscan.io/tx/";
          break;
        case 42161: // Arbitrum One
          baseUrl = "https://arbiscan.io/tx/";
          break;
        case 421613: // Arbitrum Sepolia
          baseUrl = "https://sepolia.arbiscan.io/tx/";
          break;
        case 84531: // Base Goerli
          baseUrl = "https://goerli.basescan.org/tx/";
          break;
        // Add more networks as needed
      }
    }

    return baseUrl + txHash;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddTag = () => {
    if (tag.trim() !== "" && !formData.tags.includes(tag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
      setTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setFileError("File size should not exceed 10MB");
        setSelectedFile(null);
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only PDF and DOC/DOCX files are allowed");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setFileError("");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Project title is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    } else if (formData.description.trim().length < 50) {
      errors.description = "Description should be at least 50 characters";
      isValid = false;
    }

    if (!formData.fundingAmount.trim()) {
      errors.fundingAmount = "Funding amount is required";
      isValid = false;
    } else if (
      isNaN(parseFloat(formData.fundingAmount)) ||
      parseFloat(formData.fundingAmount) <= 0
    ) {
      errors.fundingAmount = "Funding amount must be a positive number";
      isValid = false;
    }

    if (!formData.timeline.trim()) {
      errors.timeline = "Timeline is required";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Category is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isActive) {
      alert("Please connect your wallet to submit a proposal");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setTxHash(null);

    try {
      if (!provider) {
        throw new Error("Wallet provider not available");
      }

      // Get signer from provider
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(
        PROJECT_REGISTRY_ADDRESS,
        ProductRegistryABI,
        signer
      );

      // Format funding amount as wei (ETH * 10^18)
      const fundingGoal = ethers.parseEther(formData.fundingAmount);

      console.log("Submitting project:", {
        name: formData.title,
        fundingGoal: fundingGoal.toString(),
      });

      // Call the smart contract function with only the required parameters
      // Note: Only passing name and fundingGoal as per the contract requirements
      const tx = await contract.submitProject(formData.title, fundingGoal);

      console.log("Transaction sent:", tx.hash);

      // Store transaction hash for display
      setTxHash(tx.hash);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Store additional metadata if needed (could be saved to local storage or a database)
      const metadata = {
        description: formData.description,
        timeline: formData.timeline,
        category: formData.category,
        tags: formData.tags,
        // If we had file storage, we would add a fileUrl here
      };

      // Store metadata (this is just for demonstration, in a real app you'd save it somewhere)
      console.log("Additional metadata:", metadata);

      // Reset form on success
      setFormData({
        title: "",
        description: "",
        fundingAmount: "",
        timeline: "",
        category: "research",
        tags: [],
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 15000);
    } catch (error) {
      console.error("Error submitting proposal:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTEEExplanation = () => (
    <div className={styles.teeExplanation}>
      <div className={styles.teeIcon}>
        <LockKey size={24} weight="fill" />
      </div>
      <div className={styles.teeContent}>
        <h3 className={styles.teeTitle}>Privacy-Protected Submission</h3>
        <p className={styles.teeText}>
          Your proposal details will be encrypted and processed in a Trusted
          Execution Environment (TEE). This ensures that sensitive project
          information remains confidential until voting begins.
        </p>
      </div>
    </div>
  );

  return (
    <div className={styles.submissionContainer}>
      <div className={styles.submissionHeader}>
        <h2 className={styles.submissionTitle}>Submit a Project Proposal</h2>
        <p className={styles.submissionDescription}>
          Propose your project to receive funding from AISecureFundDAO. All
          submissions are processed privately through our TEE network.
        </p>
      </div>

      {!isActive ? (
        <div className={styles.walletWarning}>
          <Info size={24} />
          <p>Please connect your wallet to submit a proposal</p>
        </div>
      ) : null}

      {submitSuccess && (
        <div className={styles.successMessage}>
          <CheckCircle size={24} weight="fill" />
          <div className={styles.successContent}>
            <span>
              Proposal submitted successfully! It will be encrypted and made
              available for voting soon.
            </span>
            {txHash && (
              <div className={styles.transactionInfo}>
                <span>Transaction Hash: </span>
                <a
                  href={getExplorerUrl(txHash, chainId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.hashLink}
                >
                  {txHash.substring(0, 10)}...
                  {txHash.substring(txHash.length - 8)}
                  <ArrowRight size={14} className={styles.linkIcon} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {submitError && (
        <div className={styles.errorMessage}>
          <X size={24} weight="fill" />
          <span>Error submitting proposal: {submitError}</span>
        </div>
      )}

      <form className={styles.submissionForm} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              <FileText size={18} />
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a concise title for your project"
              className={`${styles.formInput} ${
                formErrors.title ? styles.inputError : ""
              }`}
              disabled={isSubmitting}
            />
            {formErrors.title && (
              <span className={styles.errorMessage}>{formErrors.title}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.formLabel}>
              <Hash size={18} />
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`${styles.formSelect} ${
                formErrors.category ? styles.inputError : ""
              }`}
              disabled={isSubmitting}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <span className={styles.errorMessage}>{formErrors.category}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.formLabel}>
            <FileText size={18} />
            Project Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of your project, its goals, and impact"
            className={`${styles.formTextarea} ${
              formErrors.description ? styles.inputError : ""
            }`}
            rows={5}
            disabled={isSubmitting}
          />
          {formErrors.description && (
            <span className={styles.errorMessage}>
              {formErrors.description}
            </span>
          )}
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="fundingAmount" className={styles.formLabel}>
              <CurrencyEth size={18} />
              Funding Amount (ETH)
            </label>
            <input
              type="text"
              id="fundingAmount"
              name="fundingAmount"
              value={formData.fundingAmount}
              onChange={handleInputChange}
              placeholder="Enter the amount of ETH requested"
              className={`${styles.formInput} ${
                formErrors.fundingAmount ? styles.inputError : ""
              }`}
              disabled={isSubmitting}
            />
            {formErrors.fundingAmount && (
              <span className={styles.errorMessage}>
                {formErrors.fundingAmount}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="timeline" className={styles.formLabel}>
              <Calendar size={18} />
              Timeline (weeks)
            </label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              placeholder="Estimated project duration in weeks"
              className={`${styles.formInput} ${
                formErrors.timeline ? styles.inputError : ""
              }`}
              disabled={isSubmitting}
            />
            {formErrors.timeline && (
              <span className={styles.errorMessage}>{formErrors.timeline}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Hash size={18} />
            Tags
          </label>
          <div className={styles.tagInput}>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              placeholder="Add relevant tags and press Enter"
              className={styles.formInput}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className={styles.addTagButton}
              disabled={isSubmitting || !tag.trim()}
            >
              Add
            </button>
          </div>
          <div className={styles.tagsContainer}>
            {formData.tags.map((t, index) => (
              <span key={index} className={styles.tag}>
                {t}
                <button
                  type="button"
                  className={styles.removeTagButton}
                  onClick={() => handleRemoveTag(t)}
                  disabled={isSubmitting}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <FileText size={18} />
            Supporting Documents (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            disabled={isSubmitting}
          />
          <div className={styles.fileUpload} onClick={triggerFileInput}>
            <ArrowUp size={24} />
            <span>
              {selectedFile
                ? selectedFile.name
                : "Click to upload or drag and drop"}
            </span>
            <p className={styles.fileHint}>PDF, DOC or DOCX (max. 10MB)</p>
          </div>
          {selectedFile && (
            <div className={styles.selectedFile}>
              <FileText size={16} />
              <span>{selectedFile.name}</span>
              <button
                type="button"
                className={styles.removeFileButton}
                onClick={removeFile}
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {fileError && (
            <span className={styles.errorMessage}>{fileError}</span>
          )}
        </div>

        {renderTEEExplanation()}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !isActive}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <ShieldCheck size={18} weight="fill" />
                Submit Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectSubmission;
