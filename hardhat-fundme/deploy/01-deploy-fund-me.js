const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUSDPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUSDPriceFeedAddress = ethUsdAggregator.address
    } else {
        const ethUSDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //when going for localhost or hardhat network we want to use a mock

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [], // put price feed address
        log: true,
    })
    log("------------------------------------------------------------------------------")

}

module.exports.tags = ["ethUsdPriceFeedAddress"]
