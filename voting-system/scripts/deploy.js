const { ethers } = require("hardhat");

async function main() {
  // Get the accounts from Hardhat
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Ballot contract
  const Ballot = await ethers.getContractFactory("Ballot");
  const ballot = await Ballot.deploy(); // Use Ballot.deploy instead of upgrades.deployProxy

  console.log("The address of the contract is ", await ballot.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
