/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { RpsCasino } from "../typechain";
import { assert, expect } from "chai";
import setupContracts from "../helpers/setupContracts";
import { ONE_ETH } from "../helpers/constants";
const { getSigners, provider, utils } = ethers;
const { parseEther } = utils;

describe("RpsCasino withdrawFunds", () => {
  let rpsCasino: RpsCasino;
  let deployer: SignerWithAddress;
  let player: SignerWithAddress;

  beforeEach(async () => {
    [deployer, player] = await getSigners();

    const contracts = await setupContracts();
    rpsCasino = contracts.rpsCasino;

    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });
  });

  it("funds of rps casino can be withdrawn", async () => {
    const withdrawnAmount = parseEther("0.1");
    const deployerBalanceBeforeClaiming = await deployer.getBalance();
    const casinoBalanceBeforeClaiming = await provider.getBalance(
      rpsCasino.address
    );

    // Player 1 claims his winning bet
    await expect(rpsCasino.connect(deployer).withdrawFunds(withdrawnAmount))
      .to.emit(rpsCasino, "FundsWithdrawn")
      .withArgs(deployer.address, withdrawnAmount);

    // Check balance after claiming
    const deployerBalanceAfterClaiming = await deployer.getBalance();
    const casinoBalanceAfterClaiming = await provider.getBalance(
      rpsCasino.address
    );

    const diffInPlayer1Balance = deployerBalanceAfterClaiming.sub(
      deployerBalanceBeforeClaiming
    );
    const percentageDifference = withdrawnAmount
      .sub(diffInPlayer1Balance)
      .div(diffInPlayer1Balance);
    assert.isAtMost(percentageDifference.toNumber(), 0.001); // due to loss in gas fee

    expect(
      casinoBalanceBeforeClaiming.sub(casinoBalanceAfterClaiming)
    ).to.equal(withdrawnAmount);
  });

  it("funds of rps casino can NOT be withdrawn by non-owner", async () => {
    const withdrawnAmount = parseEther("0.1");

    await expect(
      rpsCasino.connect(player).withdrawFunds(withdrawnAmount)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("funds of rps casino can NOT be withdrawn by non-owner", async () => {
    const withdrawnAmount = ONE_ETH.add(1);

    await expect(
      rpsCasino.connect(deployer).withdrawFunds(withdrawnAmount)
    ).to.be.revertedWith("RpsCasino: low contract balance");
  });
});
