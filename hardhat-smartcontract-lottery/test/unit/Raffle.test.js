const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Uint tests", async function () {
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", async function () {
              it("initializes the raffle correctly", async function () {
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["keepersUpdateInterval"])
              })
          })

          describe("enterRaffle", async function () {
              it("reverts when you dont pay enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__SendMoreToEnterRaffle",
                  )
              })
              it("records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event on enter", async function () {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter",
                  )
              })
              it("doesnt allow entrace when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep("0x")
                  await expect(
                      raffle.enterRaffle({ value: raffleEntranceFee }),
                  ).to.be.revertedWithCustomError(raffle, "Raffle__RaffleNotOpen")
              })
              describe("checkUpkeep", async function () {
                  it("returns false if people haven't sent any ETH", async function () {
                      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                      await network.provider.send("evm_mine", [])
                      const { upkeepNeeded } = await raffle.checkUpkeep.staticCall(new Uint8Array())
                      assert(!upkeepNeeded)
                  })
                  it("returns false if raffle isnt open", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                      await network.provider.send("evm_mine", [])
                      await raffle.performUpkeep("0x")
                      const raffleState = await raffle.getRaffleState()
                      const { upkeepNeeded } = await raffle.checkUpkeep.staticCall(new Uint8Array())
                      assert.equal(raffleState.toString(), "1")
                      assert.equal(upkeepNeeded, false)
                  })
              })
              describe("performUpKeep", function () {
                  it("it can only run if checkupkeep is true", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                      await network.provider.send("evm_mine", [])
                      const tx = await raffle.performUpkeep("0x")
                      assert(tx)
                  })
                  it("reverts when checkupkeep is false", async function () {
                      await expect(raffle.performUpkeep("0x")).to.be.revertedWithCustomError(
                          raffle,
                          "Raffle__UpkeepNotNeeded",
                      )
                  })
                  it("updates the raffle state, emits and event, and calls the vrfcoorindator", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                      await network.provider.send("evm_mine", [])
                      const txResponse = await raffle.performUpkeep("0x")
                      const txReceipt = await txResponse.wait(1)
                      const requestId = txReceipt.events[1].args.requestId
                      const raffleState = await raffle.getRaffleState()
                      assert(Number(requestId) > 0)
                      assert(Number(raffleState) == 1)
                  })
              })
              describe("fulfillRandomWords", function () {
                  beforeEach(async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                      await network.provider.send("evm_mine", [])
                  })
                  it("can only be called after performUpkeep", async function () {
                      await expect(
                          vrfCoordinatorV2Mock.fulfillRandomWords(0, await raffle.getAddress()),
                      ).to.be.revertedWith("nonexistant request")
                  })
              })
              it("picks a winner, resets the lottery, and sends money", async function () {
                  const additionalEntrants = 3
                  const startingAccountIndex = 1
                  const accounts = await ethers.getSigners()

                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedRaffle = raffle.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                  }
                  const startingTimeStamp = await raffle.getLastTimeStamp()

                  // performUpKeep (mmock being chainlink keepers)
                  // fulfillRnadomWords (mock being the chainlink vrf)
                  // we will have to wait for the fulfillRandomWords to be called
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Found the event!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              const numPlayers = await raffle.getNumberofPlayers()
                              const winnerEndingBalance = await accounts[1].getBalance()
                              assert.equal(numPlayers.toString, "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)

                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(
                                      raffleEntranceFee
                                          .mul(additionalEntrants)
                                          .add(raffleEntranceFee)
                                          .toString(),
                                  ),
                              )
                          } catch (e) {
                              reject(e)
                          }
                          resolve()
                      })
                      const tx = await raffle.performUpKeep("0x")
                      const txReceipt = await tx.wait(1)
                      const winnerStartingBalance = await accounts[1].getBalance()

                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          await raffle.getAddress(),
                      )
                  })
              })
          })
      })
