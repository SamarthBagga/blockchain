const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9 //calculated value based on the gas price of

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("local network detected! deploying mocks")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks deployed")
        loadFixture("--------------------------------")
    }
}


module.exports.tags = ["all", "mocks" ]