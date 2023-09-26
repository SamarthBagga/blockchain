const { getNamedAccounts } = require("hardhat")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    // call deposit function on the weth contract
    // we need the abi and contract address
}

module.exports = { getWeth }
