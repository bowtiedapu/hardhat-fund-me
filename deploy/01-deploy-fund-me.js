const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { networkConfig, devChains } = require("../helper-hardhat-config")
// The above is the same as the below
// const helperConfig = require("../helper-hardhat-config")
// const networkCOnfig = helperConfig.networkConfig

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // The above is the same as the same as the below
    // hre.getNamedAccounts
    // hre.deployments

    log("---------- FundMe deployment: START ----------")

    let ethUsdPriceFeedAddress
    if (devChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // If the contract doesn't exist, we deploy a minimal version of it for our local testing
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 5,
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }

    log("---------- FundMe deployment: END ----------")
}

module.exports.tags = ["all", "fundme"]
