const { network } = require("hardhat")
const {
    devChains,
    devChainIDs,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    if (devChainIDs.includes(chainId)) {
        log("---------- Local network mocks deployment: START ----------")
        log("Local network deployment started for mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("---------- Local network mocks deployment: END ----------")
    }
}

// This means whenever we run "yarn hardhat deploy --tags mocks", we're going to pick up this specific
// Deploy script since "mocks" is listed in our "tags"
module.exports.tags = ["all", "mocks"]
