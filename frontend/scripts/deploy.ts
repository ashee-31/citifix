/**
 * Deploy CivicProofRegistry to Polygon Amoy testnet.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network polygonAmoy
 *
 * Requires BLOCKCHAIN_PRIVATE_KEY and BLOCKCHAIN_RPC_URL env vars.
 */

import { ethers } from "hardhat";

async function main() {
  const CivicProofRegistry = await ethers.getContractFactory("CivicProofRegistry");
  const registry = await CivicProofRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`CivicProofRegistry deployed to: ${address}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log(`\nSet BLOCKCHAIN_CONTRACT_ADDRESS=${address} in your .env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
