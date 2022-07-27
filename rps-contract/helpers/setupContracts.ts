/* eslint-disable node/no-missing-import */
// eslint-disable-next-line node/no-unpublished-import
import { ethers } from "hardhat";
import { ONE_ETH } from "./constants";
const { constants, getContractFactory } = ethers;

export default async function setupContracts() {
  const mockVrfCoordFactory = await getContractFactory("MockVRFCoordinator");
  const mockVRFCoordinator = await mockVrfCoordFactory.deploy();

  const rpsCasinoFactory = await getContractFactory("RpsCasino");
  const rpsCasino = await rpsCasinoFactory.deploy(
    mockVRFCoordinator.address,
    constants.AddressZero,
    0
  );

  await mockVRFCoordinator.deployed();
  await rpsCasino.deployed();

  await mockVRFCoordinator.setConsumer(rpsCasino.address);
  await rpsCasino.deposit(ONE_ETH, { value: ONE_ETH });

  return {
    mockVRFCoordinator,
    rpsCasino,
  };
}
