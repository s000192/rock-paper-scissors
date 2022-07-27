/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { MockVRFCoordinator, RpsCasino } from "../typechain";
import { expect } from "chai";
import setupContracts from "../helpers/setupContracts";
import { ONE_ETH } from "../helpers/constants";
const { getSigners, provider, utils } = ethers;
const { parseEther } = utils;

describe("RpsCasino pause", () => {
  let mockVRFCoordinator: MockVRFCoordinator;
  let rpsCasino: RpsCasino;
  let deployer: SignerWithAddress;
  let player: SignerWithAddress;

  beforeEach(async () => {
    [deployer, player] = await getSigners();

    const contracts = await setupContracts();
    rpsCasino = contracts.rpsCasino;
    mockVRFCoordinator = contracts.mockVRFCoordinator;

    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });
  });

  it("rps casino can be paused and unpaused", async () => {
    // functions can be called when it's NOT paused
    await rpsCasino.connect(player).bet(1, { value: parseEther("0.1") });
    provider.send("evm_mine", []);
    const betId1 = await rpsCasino.betListByAddress(player.address, 0);
    await mockVRFCoordinator.fulfillRandomWords(betId1);
    await rpsCasino.connect(player).claimBet(betId1);

    // function call will be reverted when it's paused
    await rpsCasino.connect(deployer).pause();
    await expect(
      rpsCasino.connect(player).bet(2, { value: parseEther("0.1") })
    ).to.be.revertedWith("Pausable: paused");
    await expect(rpsCasino.connect(player).claimBet(betId1)).to.be.revertedWith(
      "Pausable: paused"
    );

    // functions can be called again when it's unpaused
    await rpsCasino.connect(deployer).unpause();
    await rpsCasino.connect(player).bet(2, { value: parseEther("0.1") });
    provider.send("evm_mine", []);
    const betId2 = await rpsCasino.betListByAddress(player.address, 1);
    await mockVRFCoordinator.fulfillRandomWords(betId2);
    await rpsCasino.connect(player).claimBet(betId2);

    // functions that can be called even when it's paused
    await rpsCasino.connect(deployer).pause();
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });
    await rpsCasino.connect(deployer).withdrawFunds(parseEther("1"));
  });
});
