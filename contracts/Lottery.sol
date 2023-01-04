// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/**
 * In this Lottery Contract we want to:
 * 1- Enter the Lottery (paying some amount)
 * 2- Pick a random winner (verifiably random) [chainlink VRF -> Randomness]
 * 3- Winner has to be selected every X minutes -> completely automated [chainlink Keepers -> Automated Execution]
 */

error Lottery__NotEnoughEthEntered();
error Lottery__CallToTransferToWinnerFail();
error Lottery__NotOpen();
error Lottery__UpkeepNotNeeded(
    uint256 contractBalance,
    uint256 numberOfPlayers,
    uint256 currentState
);

/** @title A sample Lottery Contract
 *  @author George Francis
 *  @notice This contract create an untemprable decentralized smart contract for simple Lottery Game
 *  @dev This contract implements Chainlink VRF v2 and chainlink Keepers and demonstrate the utilities behind them
 */
contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface, ConfirmedOwner {
    /* Type declarations */
    enum LotteryState {
        OPEN, // 0
        CALCULATING // 1
    }

    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players; //we make this payable because the winner will be paid
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    /* Lottery Variables */
    address private s_recentWinner; // We want everyone to know who was the winner
    LotteryState private s_lotteryState;
    uint256 s_lastTimeStamp;
    uint256 private immutable i_interval;

    /* Events */
    event LotteryEnter(address indexed player);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event FullfilLotteryWinner(
        uint256 indexed requestId,
        address indexed winner,
        uint256 indexed amountWin
    );

    /*functions */
    constructor(
        address vrfCoordinatorV2, // contract
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ConfirmedOwner(msg.sender) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    function enterLottery() public payable {
        if (msg.value < i_entranceFee) {
            revert Lottery__NotEnoughEthEntered();
        }
        if (s_lotteryState != LotteryState.OPEN) {
            revert Lottery__NotOpen();
        }
        s_players.push(payable(msg.sender));
        //we want to emit an Event when we update a dynamic data structure(array or mapping)
        //convention: name events with the function name reversed
        emit LotteryEnter(msg.sender);
    }

    ///this function is marked external because it's cheaper
    ///than public and is gonna be call by chainlink VRF contract

    ///chainlink VRF is a 2 transactions process
    ///1- "The Request" the random number here we have(requestRandomWinner())
    /* //We changed this to adapt it to our performUpkeep
    function requestRandomWinner() external {
        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, //keyHash(gasLane): maximum gas price you are willing to pay for a request in wei (we named it i_gasLane)
            i_subscriptionId, // (We may have many subscriptions): The subscription ID that this contract uses for funding request.
            REQUEST_CONFIRMATIONS, //(just as Constant will be Okay for now) how many block to wait for before responding
            i_callbackGasLimit, // this set how much computation a fulfillRandomWords can be. This protect us of spending lot of gas
            NUM_WORDS // this is the number of random numbers we want to get: we only want one so lets make it a constant
        );

        emit RequestedLotteryWinner(requestId);
    }
    */

    ///2- "The Fulfill" Once we get it(random number), do something with it here we have(fulfillRandomWords())
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // - lets say we have in 10 players in our s_players(size is 10)
        // - lets say we receive randomNumber 202
        // Now do we pick a random index(player) in our array?
        // randomNumber % size(s_players) -> 202 % 10 = 2 => player at index 2 wins
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        // Lets reset our player array for next round
        s_players = new address payable[](0);
        //Lets now open our Lottery again for next round
        s_lotteryState = LotteryState.OPEN;
        //Lets reset the timestamp(last timestamp should be the current one now)
        s_lastTimeStamp = block.timestamp;
        //we want to sent his money now!
        uint256 amountWin = address(this).balance;
        (bool success, ) = recentWinner.call{value: amountWin}("");
        if (!success) {
            revert Lottery__CallToTransferToWinnerFail();
        }
        emit FullfilLotteryWinner(requestId, recentWinner, amountWin);
    }

    /**
     * @dev This is the function that the chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return true: The following should be true in order to return true
     * This can be called with data or a funtion as parameter(bytes calldata):We are not using the calldata for our purpose now
     * To know that it's time to pick a random winner (automatically calling the requestRandomWinner()):
     *  0. Check that the Lottery is open: should be in an "open" state.(we want avoid people to enter Lottery when looking for a winner)
     *  1. Our time interval should have passed
     *  2. The lottery should have at least 1 player, and have some ETH
     *  3. Our subscription (Keepers subscription) is funded with LINK (similar as we did with the VRF subscription)
     */
    function checkUpkeep(
        bytes memory /*checkData*/
    ) public override returns (bool upkeepNeeded, bytes memory /*performData*/) {
        //0. Check that the Lottery is open
        bool isOpen = (s_lotteryState == LotteryState.OPEN);
        //1. Our time interval should have passed -> (current block.timestamp - last block.timestamp) > interval
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        //2. The lottery should have at least 1 player, and have some ETH
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        //3. Our subscription (Keepers subscription)
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance); //if this true is time to request a new random number and change the Lottery state
    }

    function performUpkeep(bytes calldata /*performData*/) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_lotteryState)
            );
        }
        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, //keyHash(gasLane): maximum gas price you are willing to pay for a request in wei (we named it i_gasLane)
            i_subscriptionId, // (We may have many subscriptions): The subscription ID that this contract uses for funding request.
            REQUEST_CONFIRMATIONS, //(just as Constant will be Okay for now) how many block to wait for before responding
            i_callbackGasLimit, // this set how much computation a fulfillRandomWords can be. This protect us of spending lot of gas
            NUM_WORDS // this is the number of random numbers we want to get: we only want one so lets make it a constant
        );

        emit RequestedLotteryWinner(requestId);
    }

    /*View / Pure functions */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    //NUM_WORDS is actually in the bytecode => we are not reading its from staorage so its pure
    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
