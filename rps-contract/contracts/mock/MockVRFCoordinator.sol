//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract MockVRFCoordinator {
    uint256 public counter = 0;

    VRFConsumerBaseV2 public consumer;

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256) {
      uint256 currentCounter = counter;
      counter += 1;
      return currentCounter;
    }

    function fulfillRandomWords(uint256 requestId) external {
      uint256[] memory randomWords = new uint256[](1);
      randomWords[0] = requestId;
      consumer.rawFulfillRandomWords(requestId, randomWords);
    }

    function setConsumer(address _consumer) external {
      consumer = VRFConsumerBaseV2(_consumer);
    }
}