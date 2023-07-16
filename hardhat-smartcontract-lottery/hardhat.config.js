require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-chai-matchers")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = 
    process.env.PRIVATE_KEY ||
    "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""


module.exports = {
    defaultNetwork: "hardhat",
    networks:{
        hardhat:{
            chainId: 31337,
            blockConfirmations:1,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },

    },
    solidity: "0.8.18",
    namedAccounts : {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
}
