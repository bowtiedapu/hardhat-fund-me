const { run } = require("hardhat")

async function verify(contractAddress, args) {
    console.log("---------- Contract Verification: START ----------")
    try {
        // We wrap the 'await' with a try/catch since the contract may already be verified.
        // If a contract is already verified, it will throw an error
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract has already been verified")
        } else {
            console.log(e)
        }
    }

    console.log("---------- Contract Verification: END ----------")
}

module.exports = { verify }
