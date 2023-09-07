const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADRESSES_FILE = "../nextjs-smartcontract-lottery/constants/contractAdresses.json"
const FRONT_END_ABI_FILE = "../nextjs-smartcontract-lottery/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating frontend")
        updateContractAdresses()
        updateAbi()
    }
}

async function updateAbi(){
    const raffle = await ethers.getContract("Raffle")
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ehters.utils.FormatTypes.json))
}

async function updateContractAdresses() {
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    const currentAdresses = JSON.parse(fs.readFileSync(FRONT_END_ADRESSES_FILE, "utf8"))
    if(network.config.chainId.toString() in contractAddress){
        if(!contractAddress[chainId].includes(await raffle.getAddress())){
            currentAdresses[chainId].push(await raffle.getAddress())
        }
    }{
        currentAdresses[chainId] = [await raffle.getAddress()]
    }
    fs.writeFileSync(FRONT_END_ADRESSES_FILE,JSON.stringify(currentAdresses))
}
module.exports.tags = ["all","frontend"]
