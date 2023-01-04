const { ethers } = require("hardhat")

const networkConfig = {
    default: {
        name: "hardhat",
        keepersUpdateInterval: "30",
    },

    31337: {
        name: "localhost",
        subscriptionId: "588",
        lotteryEntranceFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", //the keyHash hier will be mocked
        callbackGasLimit: "500000", //500000 Gas
        keepersUpdateInterval: "30",
    },

    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D", //vrfCoordinatorV2 Address on GOERLi Testnet
        lotteryEntranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", //https://docs.chain.link/vrf/v2/subscription/supported-networks/
        subscriptionId: "8243", //we take create this from chainlink UI but can do it also programmatically(will be updated once created)
        callbackGasLimit: "500000", //500000 Gas
        keepersUpdateInterval: "30", //30 seconds we can change it at will depending on network from this file
    },

    1: {
        name: "ethereum",
        vrfCoordinatorV2: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909", //vrfCoordinatorV2 Address on ETHEREUM Mainnet
        lotteryEntranceFee: ethers.utils.parseEther("0.0001"),
        gasLane: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef",
        subscriptionId: "0", //we take create this from chainlink UI but can do it also programmatically(will be updated once created)
        callbackGasLimit: "500000", //500000 Gas
        keepersUpdateInterval: "30",
    },

    80001: {
        name: "mumbai",
        vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed", //vrfCoordinatorV2 Address on MUMBAI Testnet
        lotteryEntranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        subscriptionId: "102", //we take create this from chainlink UI but can do it also programmatically(will be updated once created)
        callbackGasLimit: "500000", //500000 Gas
        keepersUpdateInterval: "30",
    },

    137: {
        name: "polygon",
        vrfCoordinatorV2: "0xAE975071Be8F8eE67addBC1A82488F1C24858067", //vrfCoordinatorV2 Address on POLYGON Mainnet
        lotteryEntranceFee: ethers.utils.parseEther("0.001"),
        gasLane: "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93",
        subscriptionId: "0", //we take create this from chainlink UI but can do it also programmatically(will be updated once created)
        callbackGasLimit: "500000", //500000 Gas
        keepersUpdateInterval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}
