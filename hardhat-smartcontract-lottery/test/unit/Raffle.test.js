const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
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
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
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
                      assert.equal(upkeepNeeded,false)
                    })
              })
              describe("performUpKeep", function(){
                it("it can only run if checkupkeep is true", async function (){
                    await raffle.enterRaffle({value: raffleEntranceFee})
                    await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                    await network.provider.send("evm_mine", [])
                    const tx = await raffle.performUpkeep("0x")
                    assert(tx)
                })
              })
          })
      })
