/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { MockVRFCoordinator, RpsCasino } from "../typechain";
import { expect } from "chai";
import setupContracts from "../helpers/setupContracts";
import { ONE_ETH } from "../helpers/constants";
const { getSigners, provider, utils } = ethers;
const { parseEther } = utils;

describe("RpsCasino bet", () => {
  let mockVRFCoordinator: MockVRFCoordinator;
  let rpsCasino: RpsCasino;
  let deployer: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  beforeEach(async () => {
    [deployer, player1, player2] = await getSigners();

    const contracts = await setupContracts();
    rpsCasino = contracts.rpsCasino;
    mockVRFCoordinator = contracts.mockVRFCoordinator;
  });

  it("player can place bets with ETH under max bettable amount", async () => {
    const betAmount = parseEther("0.1");
    const choice1 = 1;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    // Player 1 places bet
    await expect(rpsCasino.connect(player1).bet(choice1, { value: betAmount }))
      .to.emit(rpsCasino, "BetPlaced")
      .withArgs(0, betAmount);
    await provider.send("evm_mine", []);
    // Expect requestRandomWords to have been called and increment counter of MockVRFCoordinator
    expect(await mockVRFCoordinator.counter()).to.equal(1);
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    const betDetail1 = await rpsCasino.betDetailById(betId1);
    const {
      amount: amount1,
      bettor: bettor1,
      bettorChoice: bettorChoice1,
    } = betDetail1;
    expect(amount1).to.equal(betAmount);
    expect(bettor1).to.equal(player1.address);
    expect(bettorChoice1).to.equal(choice1);

    expect(await rpsCasino.totalBetLocked()).to.equal(betAmount);

    // Player 2 places bet
    const choice2 = 2;
    await expect(rpsCasino.connect(player2).bet(choice2, { value: betAmount }))
      .to.emit(rpsCasino, "BetPlaced")
      .withArgs(1, betAmount);
    await provider.send("evm_mine", []);
    // Expect requestRandomWords to have been called and increment counter of MockVRFCoordinator
    expect(await mockVRFCoordinator.counter()).to.equal(2);
    const betId2 = await rpsCasino.betListByAddress(player2.address, 0);
    const betDetail2 = await rpsCasino.betDetailById(betId2);
    const {
      amount: amount2,
      bettor: bettor2,
      bettorChoice: bettorChoice2,
    } = betDetail2;
    expect(amount2).to.equal(betAmount);
    expect(bettor2).to.equal(player2.address);
    expect(bettorChoice2).to.equal(choice2);

    expect(await rpsCasino.totalBetLocked()).to.equal(betAmount.mul(2));
  });

  it("player can NOT place bets without ETH sent", async () => {
    const choice1 = 1;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    await expect(rpsCasino.connect(player1).bet(choice1)).to.be.revertedWith(
      "RpsCasino: no ETH sent for bet"
    );
  });

  it("player can place bets with max bettable amount", async () => {
    const choice1 = 1;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    const maxBettableAmount = await rpsCasino.maxBettableAmount();
    await rpsCasino.connect(player1).bet(choice1, {
      value: maxBettableAmount,
    });
  });

  it("player can NOT place bets over max bettable amount", async () => {
    const choice1 = 1;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    const maxBettableAmount = await rpsCasino.maxBettableAmount();
    await expect(
      rpsCasino.connect(player1).bet(choice1, {
        value: maxBettableAmount.add(1), // adding one wei higher than maxBettableAmount
      })
    ).to.be.revertedWith("RpsCasino: casino balance low");
  });
});
