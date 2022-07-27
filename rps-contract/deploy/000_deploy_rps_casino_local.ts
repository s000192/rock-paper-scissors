/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import setupContracts from "../helpers/setupContracts";

const func: DeployFunction = async function (_hre: HardhatRuntimeEnvironment) {
  const { mockVRFCoordinator, rpsCasino } = await setupContracts();

  console.log("MockVRFCoordinator deployed to:", mockVRFCoordinator.address);
  console.log("RpsCasino deployed to:", rpsCasino.address);
};
export default func;
func.tags = ["LocalRpsCasino"];
