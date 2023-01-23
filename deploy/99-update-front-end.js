const { ethers, network } = require("hardhat")
const fs = require("fs")
const { builtinModules } = require("module")

const FRONT_END_ADDRESSES_FILE =
    "../hh_06_hardhat-smartcontract-lottery-frontend-nextjs/constants/contractAdresses.json"
const FRONT_END_ABI_FILE =
    "../hh_06_hardhat-smartcontract-lottery-frontend-nextjs/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end")
        updateContractAddresses()
        updateAbi()
    }
}

async function updateContractAddresses() {
    const lottery = await ethers.getContract("Lottery")
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))
    const chainId = network.config.chainId.toString()
    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(lottery.address)) {
            currentAddresses[chainId].push(lottery.address)
        }
    } else {
        currentAddresses[chainId] = [lottery.address]
    }

    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

async function updateAbi() {
    const lottery = await ethers.getContract("Lottery")
    fs.writeFileSync(FRONT_END_ABI_FILE, lottery.interface.format(ethers.utils.FormatTypes.json))
}

module.exports.tags = ["all", "frontend"]
