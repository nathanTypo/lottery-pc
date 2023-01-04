const { network, ethers } = require("hardhat")
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (chainId == 31337) {
        //if deploying on developmentChains we want to grap the Mock
        //Create VRF-V2 Subscription
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        //we have the subscriptionId next step is to Fund the subscription
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    log("----------------------------------------------------------")

    const entranceFee = networkConfig[chainId]["entranceFee"]
    //for gasLane:https://docs.chain.link/vrf/v2/subscription/supported-networks/ we take the hash to our helper-config
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    const arguments = [
        vrfCoordinatorV2Address,
        networkConfig[chainId]["lotteryEntranceFee"],
        networkConfig[chainId]["gasLane"],
        subscriptionId,
        networkConfig[chainId]["callbackGasLimit"],
        networkConfig[chainId]["keepersUpdateInterval"],
    ]
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: arguments, //put Lottery constructor arguments hier
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Ensure the Lottery contract is a valid consumer of the VRFCoordinatorV2Mock contract.
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lottery.address)
    }

    // Verify the deployment on Etherscan
    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        //verify
        log("Waiting for Verification ...")
        await verify(lottery.address, arguments)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "lottery"]
