const { getNamedAccounts, ethers } = require('hardhat');
const { getWeth } = require('./getWeth');

async function main() {
	// the protocol treats everything as an ERC-20 token
	await getWeth();
	const { deployer } = await getNamedAccounts();
	const signer = await ethers.provider.getSigner();
	// Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
	const lendingPool = await getLendingPool(signer);
	const lendingPoolContractAddress = await lendingPool.getAddress();
	console.log(`Lending Pool address ${lendingPoolContractAddress}`);

    // time to depositt!!!!

    const wethTokenAddress = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
}

async function getLendingPool(account) {
	const lendingPoolAddressesProvider = await ethers.getContractAt(
		'ILendingPoolAddressesProvider',
		'0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
		account
	);
	const lendingPoolAddress =
		await lendingPoolAddressesProvider.getLendingPool();
	const lendingPool = await ethers.getContractAt(
		'ILendingPool',
		lendingPoolAddress,
		account
	);
	return lendingPool;
}

async function approveErc20(contractAddress, spenderAddress, amountToSpend, account){
    
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});