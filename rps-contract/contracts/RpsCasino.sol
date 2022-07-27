// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

/// @title Rock paper scissors casino
/// @author s000192 <tangkiwan@gmail.com>
contract RpsCasino is VRFConsumerBaseV2, Ownable, Pausable, ReentrancyGuard {
  enum RpsChoice { ROCK, PAPER, SCISSORS }

  /// STRUCTS ///

  /// @notice BetDetail
  /// @return amount The bet amount
  /// @return bettor The address of the bettor
  /// @return bettorChoice The choice of bettor
  /// @return platformChoice The choice of the casino platform
  /// @return claimed The boolean of whether the the bet is claimed
  /// @return platformChoiceReady The boolean of whether request of random words is returned from chainlink
  struct BetDetail {
    uint256 amount;
    address bettor;
    RpsChoice bettorChoice;
    RpsChoice platformChoice;
    bool claimed;
    bool platformChoiceReady;
  }

  /// @notice Chainlink VRF coordinator
  VRFCoordinatorV2Interface public coordinator;

  /// @notice LINK token
  LinkTokenInterface public linkToken;

  /// @notice Chainlink VRF coordinator address on Rinkeby
  address public vrfCoordinatorAddress = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

  /// @notice LINK token contract address on Rinkeby
  address public linkAddress = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;

  /// @notice The gas lane to use, which specifies the maximum gas price to bump to.
  bytes32 public keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

  /// @notice Total bet deposited by player and locked in this contract
  uint256 public totalBetLocked;

  /// @notice Chainlink subscription ID.
  uint64 public chainlinkSubId;

  /// @notice Call back gas limit for Chainlink VRF
  uint32 public callbackGasLimit = 100000;

  /// @notice Number of blocks for confirmation
  uint16 public requestConfirmations = 3;

  /// @notice Number of random words returned by Chainlink
  uint8 public constant NUM_WORDS = 1;

  /// @notice Returns Bet detail by bet id
  mapping(uint256 => BetDetail) public betDetailById;

  /// @notice Returns List of bets by address
  mapping(address => uint256[]) public betListByAddress;

  /// EVENTS ///

  /// @notice Emitted when a user places a bet
  /// @param betId Id of the bet
  /// @param amount The amount of the bet
  event BetPlaced(uint256 indexed betId, uint256 amount);

  /// @notice Emitted when a user claims a bet
  /// @param betId Id of the bet
  /// @param amount The amount of the bet
  event BetClaimed(uint256 indexed betId, uint256 amount);

  /// @notice Emitted when owner of this contract withdraw funds
  /// @param withdrawnTo The address where fund is withdrawn to
  /// @param amount The amount of the fund withdrawn
  event FundsWithdrawn(address withdrawnTo, uint256 amount);

  constructor(address _vrfCoordinatorAddress, address _linkAddress, uint64 _subscriptionId) VRFConsumerBaseV2(_vrfCoordinatorAddress) {
    vrfCoordinatorAddress = _vrfCoordinatorAddress;
    coordinator = VRFCoordinatorV2Interface(_vrfCoordinatorAddress);
    linkAddress = _linkAddress;
    linkToken = LinkTokenInterface(_linkAddress);
    chainlinkSubId = _subscriptionId;
  }

  /// @notice Place a bet for a rock paper scissor game
  /// @dev This function can only be called when the contract is NOT paused
  /// @dev Make sure to send ETH for the bet
  /// @dev Please check maxBettableAmount before sending ETH to bet
  /// @param _choice The choice of rock paper scissors by the user
  function bet(RpsChoice _choice) external payable whenNotPaused {
    require(msg.value > 0, "RpsCasino: no ETH sent for bet");
    require(address(this).balance >= ((totalBetLocked + msg.value) * 2), "RpsCasino: casino balance low");

    uint256 betId = requestRandomWords();
    betDetailById[betId].amount = msg.value;
    betDetailById[betId].bettor = msg.sender;
    betDetailById[betId].bettorChoice = _choice;
    betListByAddress[msg.sender].push(betId);
    totalBetLocked += msg.value;

    emit BetPlaced(betId, msg.value);
  }

  /// @notice Max bettable amount to ensure bet is claimable
  /// @return Max bettable amount
  function maxBettableAmount() public view returns(uint256) {
    return address(this).balance - (totalBetLocked * 2);
  }

  /// @notice Request random words from Chainlink VRF
  /// @return requestId The id of request for Chainlink random words
  function requestRandomWords() internal returns (uint256) {
    // Will revert if subscription is not set and funded.
    uint256 requestId = coordinator.requestRandomWords(
      keyHash,
      chainlinkSubId,
      requestConfirmations,
      callbackGasLimit,
      NUM_WORDS
    );

    return requestId;
  }

  /// @notice Claim bet for rock paper scissors bet
  /// @dev This function can only be called when the contract is NOT paused
  /// @dev Please check checkClaimableAmount before claiming bet to avoid waste of gas fee
  /// @dev Anyone can claim bets for others
  /// @param _betId Id of the bet
  function claimBet(uint256 _betId) external nonReentrant whenNotPaused {
    uint256 claimableAmount = checkClaimableAmount(_betId);
    require(claimableAmount > 0, "RpsCasino: not claimable");

    betDetailById[_betId].claimed = true;
    totalBetLocked -= betDetailById[_betId].amount;

    (bool success,) = payable(betDetailById[_betId].bettor).call{value: claimableAmount}("");
    require(success, "RpsCasino: failed to transfer");

    emit BetClaimed(_betId, claimableAmount);
  }

  /// @notice Check claimable amount for a specific bet
  /// @param _betId Id of the bet
  function checkClaimableAmount(uint256 _betId) public view returns(uint256) {
    // Chainlink has not returned a random value
    // OR the bet is claimed
    if (!betDetailById[_betId].platformChoiceReady || betDetailById[_betId].claimed) {
      return 0;
    }

    int32 choiceDiff = int32(uint32(betDetailById[_betId].bettorChoice)) - int32(uint32(betDetailById[_betId].platformChoice));

    // Draw condition
    if (choiceDiff == 0) {
      return betDetailById[_betId].amount;
    }

    // Winning condition
    if (choiceDiff == 1 || choiceDiff == -2) {
      return betDetailById[_betId].amount * 2;
    }

    // Lose condition
    return 0;
  }
  
  /// @notice Callback function for Chainlink to return random values
  /// @param requestId Id of the Chainlink request
  /// @param randomWords Array of random values
  function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) internal override {
      betDetailById[requestId].platformChoice = RpsChoice((randomWords[0] % 3));
      betDetailById[requestId].platformChoiceReady = true;

      // When user lost the bet, deduct the bet amount from totalBetLocked
      if (checkClaimableAmount(requestId) == 0) {
        totalBetLocked -= betDetailById[requestId].amount;
      }
  }
  
  /// @notice Deposit fund function open for anyone haha
  /// @dev Make sure the ETH sent is equal to _amount
  /// @param _amount Amount to deposit
  function deposit(uint256 _amount) external payable {
    require(msg.value == _amount, "RpsCasino: unmatched amount");
  }

  /// @notice Check max withdrawable amount for owner to avoid users from not being able to claim bet
  function maxOwnerWithdrawableAmount() external view returns (uint256) {
    return address(this).balance - (totalBetLocked * 2);
  }

  /// @notice Get bet list by address
  /// @param _address address to query
  function getBetListByAddress(address _address) external view returns (uint256[] memory) {
    // TODO: should cater the case when the address has not made any bets
    return betListByAddress[_address];
  }

  /// @notice Withdraw funds
  /// @dev Only owner of this contract is authorized
  /// @dev If it is not emergency situation, please check maxOwnerWithdrawableAmount before withdrawal
  /// @param _amount Amount to withdraw
  function withdrawFunds(uint256 _amount) external onlyOwner {
    require(address(this).balance >= _amount, "RpsCasino: low contract balance");
    address owner = owner();
    (bool success,) = payable(owner).call{value: _amount}("");
    require(success, "RpsCasino: failed to transfer");
    emit FundsWithdrawn(owner, _amount);
  }

  /// @notice Pause the contract
  /// @dev The This function can only be called by super admin
  function pause() external onlyOwner {
      _pause();
  }

  /// @notice Unpause the contract
  /// @dev The This function can only be called by super admin
  function unpause() external onlyOwner {
      _unpause();
  }
}
