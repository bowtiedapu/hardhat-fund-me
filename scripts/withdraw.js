const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    console.log("---------- FundMe withdrawal: START ----------")
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const txnResponse = await fundMe.withdraw()
    await txnResponse.wait(1)
    console.log("---------- FundMe withdrawal: END ----------")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
