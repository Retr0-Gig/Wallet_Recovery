import { ethers } from 'ethers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import 'dotenv/config';
import { Broadcast } from './Broadcast.js';

const addresses = {
  'imptToken': '0x04C17b9D3b29A78F7Bd062a57CF44FC633e71f85',
  'claimContract': '0x348e934A8a597A73FC6685e83972Bba07e496eb5'
};

const CHAIN_ID = 1;
const provider = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`);
const broadcast = new Broadcast(provider);


const priv_key_bytes = await broadcast.convert_key_bytes(process.env.NEW_WALLET_PRIV_KEY)
const new_wallet = new ethers.Wallet(priv_key_bytes, provider)
const compromised_wallet = new ethers.Wallet(process.env.COMPROMISED_WALLET_PRIV_KEY, provider)


console.log(`compomised wallet : ${compromised_wallet.address}`)
console.log(`new wallet : ${new_wallet.address}`)



async function recover() {
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, ethers.Wallet.createRandom())
  provider.on('block', async (blockNumber) => {
    console.log(blockNumber)

      const bundle = [
        // transaction to fund hacked wallet (from new wallet)
        {
          transaction: {
            chainId: CHAIN_ID,
            to:compromised_wallet.address,
            value: ethers.utils.parseEther('0.2'),
            type: 2,
            gasLimit: 21000,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: new_wallet 
        },

        // transaction to claim IMPT tokens
       /* {
          transaction: {
            chainId: CHAIN_ID,
            to: addresses.claimContract,
            data: '0x01885e1300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000348e934a8a597a73fc6685e83972bba07e496eb5',
            type: 2,
            gasLimit: 150170,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: compromised_wallet
        },

        // transaction to withdraw
        {
          transaction: {
            chainId: CHAIN_ID,
            to: addresses.imptToken,
            data: '0xa9059cbb000000000000000000000000acf6418cefd7254f5e34b2b2e9a8f081e0e150d1000000000000000000000000000000000000000000000845e16a00dd60f00000',
            type: 2,
            gasLimit: 78000,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: compromised_wallet
        },*/

        // transfer all unused ETH out of compromised wallet
        {
          transaction: {
            chainId: CHAIN_ID,
            to: new_wallet.address,
            value: new_wallet.getBalance() - ethers.utils.parseEther('0.00252'),
            type: 2,
            gasLimit: 21000,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: compromised_wallet
        },
      ]

      const flashbotsTransactionResponse = await flashbotsProvider.sendBundle(
        bundle,
        blockNumber + 1,
      );
    
    // in event of error produce error msg
    if ('error' in flashbotsTransactionResponse) {
      console.warn(flashbotsTransactionResponse.error.message)
      return
    }

    // simulate transaction
    console.log(await flashbotsTransactionResponse.simulate())
  })
}


await recover();
