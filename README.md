# Hardhat Fund Me

## How To: Build and Deploy

1. `yarn hardhat compile`
2. `yarn hardhat deploy`
3. `yarn hardhat run scripts/fund.js --network localhost` to fund the contract on your localhost

## Additional Notes, Tips, and Tricks

-   Nonce: tx count for the account
-   Gas Price: price per unit of gas (in wei)
-   Gas Limit: max gas that this tx can use
-   To: address that the tx is sent to
-   Value: amount of wei to send
-   Data: what to send to the To address
-   v, r, s: components of tx signature

*   To download the chainlink contracts, just run `yarn add --dev @chainlink/contracts`
*   Add on `yarn add --dev hardhat-deploy`
*   Add on `yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers`. This takes nomiclabs' hardhat-ethers and overrides it with hardhat-deploy-ethers. It enables ethers to remember all the different deployments which we actually make.
*   For the solidity style guide: docs.soliditylang.org/env/v0.8.13/style-guide.html
