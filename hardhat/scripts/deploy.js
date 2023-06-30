//imports
const { ethers, run, network } = require("hardhat")

//async main
async function main() {
    const simpleStorage = await ethers.deployContract("SimpleStorage")
    console.log("Deploying contract...")
    await simpleStorage.waitForDeployment()
    const address = await simpleStorage.getAddress()
    console.log(`Deployed contract to: ${address}`)
    console.log(network.config)
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deploymentTransaction().wait(6)
        await verify(await simpleStorage.getAddress(), [])
    }

    const currentValue = await simpleStorage.retrieve()
    console.log("Current value is " + currentValue)

    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1)

    const updatedValue = await simpleStorage.retrieve()
    console.log("Updated value is " + updatedValue)
}
async function verify(address, args) {
    console.log("Verifying this contract")
    try {
        await run("verify:verify", {
            address: address,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verfied")
        } else {
            console.log(e)
        }
    }
}
//main

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
