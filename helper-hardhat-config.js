const networkConfig = {
    31337: {
        name: "hardhat",
    },
    5: {
        name: "goerli",
        // Get this from https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=ethereum
        // Under Goerli Testnet
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
}

const devChains = ["hardhat", "localhost"]
const devChainIDs = [31337]

const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    devChains,
    devChainIDs,
    DECIMALS,
    INITIAL_ANSWER,
}
