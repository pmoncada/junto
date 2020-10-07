import { ethers } from "@nomiclabs/buidler";

async function main() {
  const factory = await ethers.getContractFactory("Junto");

  // If we had constructor arguments, they would be passed into deploy()
  let contract = await factory.deploy(
    0x06012c8cf97bead5deae237070f9587f8e7a2661,
    0x06012c8cf97bead5deae237070f9587f8e7a2662,
    0x06012c8cf97bead5deae237070f9587f8e7a2663,
    10,
    20,
    30
  );

  // The address the Contract WILL have once mined
  console.log(contract.address);

  // The transaction that was sent to the network to deploy the Contract
  console.log(contract.deployTransaction.hash);

  // The contract is NOT deployed yet; we must wait until it is mined
  await contract.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
