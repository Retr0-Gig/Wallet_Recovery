
### The Problem
- The **compromised wallet** has had it's private key leaked, a malicoius individual set up a bot to monitor for incoming transactions and to steal tokens as soon as they are deposited to the compromised address. 
- To claim the Stuck Asset the compromised wallet needs to be seeded with enough ETH to pay for the gas fees (without the bots stealing the ETH as soon as it is deposited). 

The solution is to send transactions to seed + claim + withdraw all in the **same block**. We can do this by sending these transactions as a bundled to the flashbot network using the [ethers-provider-flashbots-bundle](https://www.npmjs.com/package/@flashbots/ethers-provider-bundle) package.

## Transactions 
1. Send funds from `funding_wallet` to `compromised_wallet` to cover gas for claiming + transfering
2. Claim Your Stuck Asset from `compromised_wallet` 
3. Transfer Your tokens from `compromised_wallet` to `Your_New_wallet`
4. Transfer all unused ETH from `compromised_wallet` to `funding_wallet(Your_New_Wallet)`
