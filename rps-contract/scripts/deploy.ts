// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { ONE_ETH } from "../helpers/constants";
const { getContractFactory } = ethers;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // Addresses on Rinkeby
  const vrfCoordinatorAddress = "0x6168499c0cFfCaCD319c818142124B7A15E857ab";
  const linkAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
  const chainlinkSubId = 2382;

  const rpsCasinoFactory = await getContractFactory("RpsCasino");
  const rpsCasino = await rpsCasinoFactory.deploy(
    vrfCoordinatorAddress,
    linkAddress,
    chainlinkSubId
  );

  await rpsCasino.deployed();

  console.log("RpsCasino deployed to:", rpsCasino.address);
  const tx = await rpsCasino.deposit(ONE_ETH, { value: ONE_ETH });
  const receipt = await tx.wait();
  console.log(receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
