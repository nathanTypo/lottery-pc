const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")

//VRFCoordinatorV2Mock constructor parameters
const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium(look doc): it costs 0.25 LINK
const GAS_PRICE_LINK = 1e9 //(link per gas) this is a calculated value based on the gas price of the chain.

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]
    const chainId = network.config.chainId

    if (chainId == 31337) {
        //deploying on developmentChain
        log("Local network detected! Deploying mocks.")
        const lottery = await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args, //put vrfCoordinatorV2 constructor arguments hier
            log: true,
        })
        log("Mocks Deployed!")
        log("--------------------------------------------------------")
        log("You are deploying to a local network, you'll need a local network running to interact")
        log(
            "Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!"
        )
        log("----------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
