require('dotenv').config({ path: '../../.env' });
const { ethers } = require('ethers');
const { JsonRpcProvider } = require("ethers");
const { formatEther } = ethers;


const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = '0x44FE06D2940b8782A0a9a9FFD09c65852c0156b1';

const fs = require('fs');
const minifiedCode = fs.readFileSync('./process_votes_and_bids.min.js', 'utf8');

async function main() {
    const provider = new JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");
        if (balance === 0n) {
            throw new Error("Insufficient funds in wallet");
        }
    

        const abi = [
            {"inputs":[{"internalType":"string","name":"inputData","type":"string"}],"name":"saveCodeInCallData","outputs":[],"stateMutability":"nonpayable","type":"function"}
        ];
        

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    console.log("Minified code size (bytes):", minifiedCode.length);
    console.log("Deploying serverless function to Arbitrum Sepolia...");
    
    const tx = await contract.saveCodeInCallData(minifiedCode, {
        gasLimit: 100000000,
        maxFeePerGas: ethers.parseUnits("2", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("1", "gwei")
    });
    
    


    try {
        const receipt = await tx.wait();
        console.log("Deployment successful! Transaction hash:", receipt.hash);
      } catch (error) {
        console.error("Error during transaction confirmation:", error);
        console.log("Last known transaction hash:", tx.hash);
      }
      
}

main().catch((error) => {
    console.error("Error deploying serverless function:", error);
    if (error.transaction) {
        console.error("Transaction data:", error.transaction.data);
    }
});
