// scripts/deploy.js
async function main() {
    // Hardhat setup and provider instantiation
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account:", deployer.address)

    // Deploy ProjectNFT contract
    const ProjectNFT = await ethers.getContractFactory("ProjectNFT")
    const projectNFT = await ProjectNFT.deploy()

    console.log("ProjectNFT deployed to:", await projectNFT.getAddress())
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
