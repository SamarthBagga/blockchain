const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("./getWeth")

async function main() {
    // the protocol treats everything as an ERC-20 token
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.provider.getSigner()
    // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(signer)
    const lendingPoolContractAddress = await lendingPool.getAddress()
    console.log(`Lending Pool address ${lendingPoolContractAddress}`)

    // time to depositt!!!!

    const wethTokenAddress = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"

    //approve
    await approveErc20(
        wethTokenAddress,
        await lendingPool.getAddress(),
        AMOUNT,
        deployer
    )
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited !!!")
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    return lendingPool
}

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account
    )
    console.log("got the contract")
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
