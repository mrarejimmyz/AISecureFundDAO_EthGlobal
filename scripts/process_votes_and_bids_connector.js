const ethers = require('ethers');
const axios = require('axios');

const CONTRACT_ADDRESS = 'YOUR_SMART_CONTRACT_ADDRESS';
const TEE_ENDPOINT = 'BASE32_TX_HASH.oyster.run';

const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

contract.on('VotesSubmitted', async (proposalId, votesData) => {
    console.log(`Processing votes for proposal ${proposalId}...`);
    try {
        const response = await axios.post(`https://${TEE_ENDPOINT}`, {
            type: 'vote',
            votes: votesData,
        });

        console.log(`Processed results:`, response.data);
    } catch (error) {
        console.error('Error processing votes:', error);
    }
});
