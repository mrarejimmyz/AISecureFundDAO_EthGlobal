import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';


dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Network configuration
const RPC_URL = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = process.env.INDEXER_RPC || 'https://indexer-storage-testnet-standard.0g.ai';
// Format private key correctly with 0x prefix if needed
const PRIVATE_KEY = process.env.PRIVATE_KEY ? 
  (process.env.PRIVATE_KEY.startsWith('0x') ? 
    process.env.PRIVATE_KEY : 
    `0x${process.env.PRIVATE_KEY}`) : 
  '';

export class StorageService {
  private indexer: Indexer;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.indexer = new Indexer(INDEXER_RPC);
  }

  // Upload file to 0G Storage
async uploadFile(filePath: string): Promise<{rootHash: string, transactionHash: string}> {
    try {
      const zgFile = await ZgFile.fromFilePath(filePath);
      const [tree, treeErr] = await zgFile.merkleTree();
      
      if (treeErr) {
        throw new Error(`Failed to create merkle tree: ${treeErr}`);
      }
      
      if (!tree) {
        throw new Error("Merkle tree is null");
      }
      
      const rootHash = tree.rootHash();
      if (!rootHash) {
        throw new Error("Root hash is null");
      }
      
      const [tx, uploadErr] = await this.indexer.upload(zgFile, RPC_URL, this.signer);
      
      if (uploadErr) {
        throw new Error(`Failed to upload file: ${uploadErr}`);
      }
      
      if (!tx) {
        throw new Error("Transaction hash is null");
      }
      
      return {
        rootHash: rootHash,
        transactionHash: tx
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  

  // Download file from 0G Storage
  async downloadFile(rootHash: string, outputPath: string): Promise<void> {
    try {
      const err = await this.indexer.download(rootHash, outputPath, true);
      if (err) {
        throw new Error(`Failed to download file: ${err}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Store key-value data
  async storeKeyValue(key: string, value: any): Promise<void> {
    // For demo purposes, we'll store the key-value mapping in a local file
    // In a real implementation, you would use 0G's key-value storage service
    const kvPath = path.join(__dirname, '../kv-store');
    if (!fs.existsSync(kvPath)) {
      fs.mkdirSync(kvPath, { recursive: true });
    }
    fs.writeFileSync(path.join(kvPath, `${key}.json`), JSON.stringify(value));
  }

  // Retrieve key-value data
  async retrieveKeyValue(key: string): Promise<any> {
    const kvPath = path.join(__dirname, '../kv-store');
    const filePath = path.join(kvPath, `${key}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}
