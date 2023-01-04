const { ethers, deployments } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Staging Tests", async () => {
          let lottery, lotteryContract, lotteryEntranceFee, deployer // , deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]
              lotteryContract = await ethers.getContract("Lottery") // Returns a new connection to the Lottery contract
              lottery = lotteryContract.connect(deployer) // Returns a new instance of the Lottery contract connected to deployer
              lotteryEntranceFee = await lottery.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async () => {
                  // Enter Lottery
                  const startingTimeStamp = await lottery.getLatestTimeStamp()

                  await new Promise(async (resolve, reject) => {
                      //setup listener before we enter the lottery
                      //Just in case the blockchain moves REALLY fast
                      lottery.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              // add our asserts here
                              const recentWinner = await lottery.getRecentWinner()
                              const lotteryState = await lottery.getLotteryState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await lottery.getLatestTimeStamp()

                              await expect(lottery.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(lotteryState, 0)
                              assert
                                  .equal(
                                      winnerEndingBalance.toString(),
                                      winnerStartingBalance.add(lotteryEntranceFee)
                                  )
                                  .toString()
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject()
                          }
                      })
                      // Then entering the lottery
                      await lottery.enterLottery({ value: lotteryEntranceFee })
                      const winnerStartingBalance = await accounts[0].getBalance()

                      // and This code WONT complete until our listener has finish
                  })
              })
          })
      })
// In order for Us to get this staging test from end to end we gonna need:
// 1. Get our SubId for Chainlink VRF -> vrf.chain.link
// 2. Deploy our contract using the SubId
// 3. Register the contract with Chainlink VRF & its subId
// 4. Register the contract with Chainlink Keepers -> keepers.chain.link
// 5. Run staging tests
