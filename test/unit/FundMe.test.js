const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")

describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        /**
         * While the above can get you your named accounts, you could also do this:
         * const accounts = await ethers.getSigners()
         * const accountZero = accounts[0]
         */

        await deployments.fixture(["all"])
        // Gets the most recently deployed contract
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
})
