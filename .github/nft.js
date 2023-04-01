// import the necessary Hardhat plugins and dependencies
const { ethers } = require('hardhat');

async function main() {
  // deploy the NFT contract
  const NFTContract = await ethers.getContractFactory('contracts/NewContract.sol:NFT');
  const nft = await NFTContract.deploy();

  // wait for the contract to be mined
  await nft.deployed();

  // log the contract address to the console
  console.log('NFT contract deployed to:', nft.address);
}

// call the main function
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
