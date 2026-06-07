import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    somniaTestnet: {
      url: process.env.SOMNIA_RPC || "https://api.infra.testnet.somnia.network",
      chainId: 50312,
      accounts: [PRIVATE_KEY],
    },
    somniaMainnet: {
      url: "https://api.infra.mainnet.somnia.network",
      chainId: 5031,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
