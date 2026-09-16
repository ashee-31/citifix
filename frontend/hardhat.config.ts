import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Polygon Amoy testnet (default for CivicProof)
    polygonAmoy: {
      type: "http",
      url: process.env.BLOCKCHAIN_RPC_URL ?? "https://rpc-amoy.polygon.technology",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY
        ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
        : [],
    },
    // Local hardhat network for development/testing
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};

export default config;
