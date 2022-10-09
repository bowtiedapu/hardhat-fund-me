const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe(
describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator

    // Converts 1 ETH into '1000000000000000000'
    const sendValue = ethers.utils.parseEther("1")
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
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if enough ETH isn't sent", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("adds one address who funds the contract to the array of s_funders", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const txnResponse = await fundMe.withdraw()
            const txnReceipt = await txnResponse.wait(1)

            // This is how we can pull attributes out of an object in js
            const { gasUsed, effectiveGasPrice } = txnReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0)

            // Our deployer uses gas, so we need to add it to our ending deployer balance
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("allows us to withdraw with multiple s_funders", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                // By default, deployer is the account connected to our fundMe contract.
                // We need to make sure that each account is connected as well, and this is how we can do that.
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )

                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const txnResponse = await fundMe.withdraw()
            const txnReceipt = await txnResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = txnReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0)

            // Our deployer uses gas, so we need to add it to our ending deployer balance
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString()
            )

            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attackerConnectedContract = await fundMe.connect(accounts[1])
            // TODO: Need to figure out why our custom error isn't working yet
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })

        it("only allows the owner to withdraw via the gasOptimizedWithdraw function", async function () {
            const accounts = await ethers.getSigners()
            const attackerConnectedContract = await fundMe.connect(accounts[1])
            // TODO: Need to figure out why our custom error isn't working yet
            await expect(attackerConnectedContract.gasOptimizedWithdraw()).to.be
                .reverted
        })

        it("withdraw ETH from a single founder via the gasOptimizedWithdraw function", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const txnResponse = await fundMe.gasOptimizedWithdraw()
            const txnReceipt = await txnResponse.wait(1)

            // This is how we can pull attributes out of an object in js
            const { gasUsed, effectiveGasPrice } = txnReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0)

            // Our deployer uses gas, so we need to add it to our ending deployer balance
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("allows us to withdraw with multiple s_funders via the gasOptimizedWithdraw function", async function () {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                // By default, deployer is the account connected to our fundMe contract.
                // We need to make sure that each account is connected as well, and this is how we can do that.
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )

                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const txnResponse = await fundMe.gasOptimizedWithdraw()
            const txnReceipt = await txnResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = txnReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance, 0)

            // Our deployer uses gas, so we need to add it to our ending deployer balance
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance),
                endingDeployerBalance.add(gasCost).toString()
            )

            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
    })
})
