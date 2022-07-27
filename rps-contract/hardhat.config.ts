import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "solidity-coverage";

dotenv.config();

const { DEPLOYER_PRIVATE_KEY, PLAYER_ONE_PRIVATE_KEY, PLAYER_TWO_PRIVATE_KEY } =
  process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.RINKEBY_URL || "",
      },
      accounts: [
        {
          privateKey: DEPLOYER_PRIVATE_KEY || "",
          balance: "3321000000000000000000000",
        },
        {
          privateKey: PLAYER_ONE_PRIVATE_KEY || "",
          balance: "3321000000000000000000000",
        },
        {
          privateKey: PLAYER_TWO_PRIVATE_KEY || "",
          balance: "3321000000000000000000000",
        },
      ],
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        DEPLOYER_PRIVATE_KEY !== undefined ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
