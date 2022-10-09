const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    console.log("---------- FundMe funding: START ----------")
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const txnResponse = await fundMe.fund({
        value: ethers.utils.parseEther("1"),
    })

    await txnResponse.wait(1)
    console.log("---------- FundMe funding: END ----------")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
