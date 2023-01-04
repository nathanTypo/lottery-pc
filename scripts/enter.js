const { ethers } = require("hardhat")

async function enterLottery() {
    const lottery = await ethers.getContract("Lottery")
    const entranceFee = await lottery.getEntranceFee()
    await lottery.enterLottery({ value: entranceFee + 1 })
    console.log("Entered!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
enterLottery().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
