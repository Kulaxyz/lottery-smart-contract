//SPDX-Licence-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Lottery__NotEnoughMoney();
error Lottery__FailPick();
error Lottery__NotAvailable();

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum State {
        Open,
        Calculating,
        Closed
    }

    event ParticipantEnter(address indexed participant, uint256 amount);
    event WinnerPicked(address indexed participant, uint256 amount);
    event RandomWordsRequestSent(uint256 requestId);

    uint256 private immutable i_tax;
    address[] private s_participants;
    State private s_state;
    address private s_lastWinner;
    uint256 private immutable i_updateInterval;
    uint256 private s_lastPicked;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    VRFCoordinatorV2Interface private i_vrfCoordinator;

    uint16 private constant BLOCK_CONFIRMATIONS = 6;
    uint32 private constant GAS_LIMIT = 6000000;

    constructor(
        address vrfCoordinatorV2,
        uint256 _tax,
        bytes32 keyHash,
        uint64 subId,
        uint256 updateInterval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_keyHash = keyHash;
        i_tax = _tax;
        s_state = State.Open;
        i_subId = subId;
        i_updateInterval = updateInterval;
        s_lastPicked = block.timestamp;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    }

    function enter() public payable {
        if (msg.value < i_tax) revert Lottery__NotEnoughMoney();
        if (s_state != State.Open) revert Lottery__NotAvailable();

        s_participants.push(msg.sender);

        emit ParticipantEnter(msg.sender, msg.value);
    }

    function checkUpkeep(bytes memory) public view override returns (bool upkeepNeeded, bytes memory) {
        bool hasParticipants = s_participants.length > 1;
        bool isOpen = s_state == State.Open;
        bool hasBalance = address(this).balance > 0;
        bool isUpToDate = (block.timestamp - s_lastPicked) > i_updateInterval;

        return (hasParticipants && isOpen && hasBalance && isUpToDate, "0x0");
    }

    function performUpkeep(bytes calldata) external override {
        (bool needPerform, ) = checkUpkeep("");
        if (!needPerform) revert Lottery__NotAvailable();

        s_state = State.Calculating;

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            BLOCK_CONFIRMATIONS,
            GAS_LIMIT,
            1
        );

        emit RandomWordsRequestSent(requestId);
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        if (s_state != State.Calculating) return;
        if (randomWords[0] == 0) return;

        uint256 len = s_participants.length;
        address winner = s_participants[randomWords[0] % len];

        uint256 amount = address(this).balance;
        (bool success,) = payable(winner).call{value: amount}("");
        if(!success) revert Lottery__FailPick();

        s_lastWinner = winner;
        s_participants = new address[](0);
        s_state = State.Open;

        s_lastPicked = block.timestamp;

        emit WinnerPicked(winner, amount);
    }

    function getTax() public view returns(uint256) {
        return i_tax;
    }

    function getInterval() public view returns(uint256) {
        return i_updateInterval;
    }
}
