import { ethers } from "hardhat";

async function main() {
  const Sentinel = await ethers.getContractFactory("CerberusSentinel");
  const sentinel = await Sentinel.deploy();
  await sentinel.waitForDeployment();

  const address = await sentinel.getAddress();
  console.log(`CerberusSentinel deployed to: ${address}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("");
  console.log("Add to .env:");
  console.log(`SENTINEL_ADDRESS=${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
