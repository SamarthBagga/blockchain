const { ethers, network } = require("hardhat")
const fs  = require("fs");

const FRONT_END_ADDRESSES_FILE = "../nextjs-smartcontract-lottery/constants/contractAddresses.json"
const FRONT_END_ABI_FILE = "../nextjs-smartcontract-lottery/constants/abi.json"   

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating frontend")
        await updateContractAddresses()
        await updateAbi()
        console.log("frontend written!")
    }
}

async function updateAbi() {
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
    console.log("added abi")
}

async function updateContractAddresses() {
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[chainId].includes(await raffle.getAddress())) {
            contractAddresses[chainId].push(await raffle.getAddress())
        }
    } else {
        contractAddresses[chainId] = [await raffle.getAddress()]
    }
    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(contractAddresses))
    console.log("added address")
}
module.exports.tags = ["all", "frontend"]
