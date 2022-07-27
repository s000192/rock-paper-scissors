/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { MockVRFCoordinator, RpsCasino } from "../typechain";
import { assert, expect } from "chai";
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

  it("player can claim winning bets", async () => {
    const betAmount = parseEther("0.1");
    const choice = 1;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    // Player 1 places bet (and should win)
    // Player 1's choice: PAPER (1)
    // Platform's choice: ROCK (0)
    await rpsCasino.connect(player1).bet(choice, { value: betAmount });
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    await provider.send("evm_mine", []);
    await mockVRFCoordinator.fulfillRandomWords(betId1);

    // Check balance before claiming
    const player1BalanceBeforeClaiming = await player1.getBalance();
    const casinoBalanceBeforeClaiming = await provider.getBalance(
      rpsCasino.address
    );

    const expectedTransferredValue = betAmount.mul(2);
    // Player 1 claims his winning bet
    await expect(rpsCasino.connect(player1).claimBet(betId1))
      .to.emit(rpsCasino, "BetClaimed")
      .withArgs(0, expectedTransferredValue);

    // Check balance after claiming
    const player1BalanceAfterClaiming = await player1.getBalance();
    const casinoBalanceAfterClaiming = await provider.getBalance(
      rpsCasino.address
    );

    const diffInPlayer1Balance = player1BalanceAfterClaiming.sub(
      player1BalanceBeforeClaiming
    );
    const percentageDifference = expectedTransferredValue
      .sub(diffInPlayer1Balance)
      .div(diffInPlayer1Balance);
    assert.isAtMost(percentageDifference.toNumber(), 0.001); // due to loss in gas fee

    expect(
      casinoBalanceBeforeClaiming.sub(casinoBalanceAfterClaiming)
    ).to.equal(expectedTransferredValue);

    const betDetail1 = await rpsCasino.betDetailById(betId1);
    expect(betDetail1.claimed).to.equal(true);
    expect(await rpsCasino.totalBetLocked()).to.equal(0);
  });

  it("player can claim draw bets", async () => {
    const betAmount = parseEther("0.1");
    const choice = 0;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    // Player 1 places bet (and should draw)
    // Player 1's choice: ROCK (0)
    // Platform's choice: ROCK (0)
    await rpsCasino.connect(player1).bet(choice, { value: betAmount });
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    await provider.send("evm_mine", []);
    await mockVRFCoordinator.fulfillRandomWords(betId1);

    // Check balance before claiming
    const player1BalanceBeforeClaiming = await player1.getBalance();
    const casinoBalanceBeforeClaiming = await provider.getBalance(
      rpsCasino.address
    );

    const expectedTransferredValue = betAmount;
    // Player 1 claims his draw bet
    await expect(rpsCasino.connect(player1).claimBet(betId1))
      .to.emit(rpsCasino, "BetClaimed")
      .withArgs(0, expectedTransferredValue);

    // Check balance after claiming
    const player1BalanceAfterClaiming = await player1.getBalance();
    const casinoBalanceAfterClaiming = await provider.getBalance(
      rpsCasino.address
    );

    const diffInPlayer1Balance = player1BalanceAfterClaiming.sub(
      player1BalanceBeforeClaiming
    );
    const percentageDifference = expectedTransferredValue
      .sub(diffInPlayer1Balance)
      .div(diffInPlayer1Balance);
    assert.isAtMost(percentageDifference.toNumber(), 0.001); // due to loss in gas fee

    expect(
      casinoBalanceBeforeClaiming.sub(casinoBalanceAfterClaiming)
    ).to.equal(expectedTransferredValue);

    const betDetail1 = await rpsCasino.betDetailById(betId1);
    expect(betDetail1.claimed).to.equal(true);
    expect(await rpsCasino.totalBetLocked()).to.equal(0);
  });

  it("player can NOT claim losing bets", async () => {
    const betAmount = parseEther("0.1");
    const choice = 2;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    // Player 1 places bet (and should lose)
    // Player 1's choice: SCISSORS (2)
    // Platform's choice: ROCK (0)
    await rpsCasino.connect(player1).bet(choice, { value: betAmount });
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    await provider.send("evm_mine", []);
    await mockVRFCoordinator.fulfillRandomWords(betId1);

    // Player 1 claims his losing bet
    await expect(
      rpsCasino.connect(player1).claimBet(betId1)
    ).to.be.revertedWith("RpsCasino: not claimable");
  });

  it("two players can claim bets consecutively", async () => {
    const betAmount = parseEther("0.1");
    const choice = 1;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    await rpsCasino.connect(player1).bet(choice, { value: betAmount });
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    await rpsCasino.connect(player2).bet(choice, { value: betAmount });
    const betId2 = await rpsCasino.betListByAddress(player2.address, 0);
    await provider.send("evm_mine", []);
    await mockVRFCoordinator.fulfillRandomWords(betId1);
    await mockVRFCoordinator.fulfillRandomWords(betId2);

    // Player 1 claims his bet
    await rpsCasino.connect(player1).claimBet(betId1);
    expect(await rpsCasino.totalBetLocked()).to.equal(betAmount);

    // Player 2 claims his bet
    await rpsCasino.connect(player2).claimBet(betId2);
    expect(await rpsCasino.totalBetLocked()).to.equal(0);
  });

  it("player can NOT claim when chainlink still has not returned the random value", async () => {
    const betAmount = parseEther("0.1");
    const choice = 2;
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    await rpsCasino.connect(player1).bet(choice, { value: betAmount });
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    await provider.send("evm_mine", []);

    await expect(
      rpsCasino.connect(player1).claimBet(betId1)
    ).to.be.revertedWith("RpsCasino: not claimable");
  });

  it("player can NOT claim a bet which is already claimed", async () => {
    const betAmount = parseEther("0.1");
    const choice = 1; // PAPER
    await rpsCasino.connect(deployer).deposit(ONE_ETH, { value: ONE_ETH });

    // Player 1 places bet (and should win)
    // Player 1's choice: PAPER (1)
    // Platform's choice: ROCK (0)
    await rpsCasino.connect(player1).bet(choice, { value: betAmount });
    const betId1 = await rpsCasino.betListByAddress(player1.address, 0);
    await provider.send("evm_mine", []);
    await mockVRFCoordinator.fulfillRandomWords(betId1); // ROCK

    // Player 1 claims his bet for the first time
    await rpsCasino.connect(player1).claimBet(betId1);

    // Should revert if Player 1 claims for the second time
    await expect(
      rpsCasino.connect(player1).claimBet(betId1)
    ).to.be.revertedWith("RpsCasino: not claimable");
  });
});
