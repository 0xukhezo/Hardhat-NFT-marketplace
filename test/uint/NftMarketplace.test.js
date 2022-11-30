const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Test", function () {
          let nftMarketplace, basicNft, deployer, player
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0
          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              player = accounts[1]
              const basicNftContractAddress = await deployments.fixture([
                  "basicNft",
              ])
              const nftMarketplaceContractAddress = await deployments.fixture([
                  "NftMarketplace",
              ])
              nftMarketplace = await ethers.getContractAt(
                  "NftMarketplace",
                  nftMarketplaceContractAddress.NftMarketplace.address,
                  deployer
              )
              basicNft = await ethers.getContractAt(
                  "BasicNft",
                  basicNftContractAddress.BasicNft.address,
                  deployer
              )

              const txResponse = await basicNft.mintNft()
              await txResponse.wait(1)
              await basicNft.approve(nftMarketplace.address, TOKEN_ID)
          })
          it("Test 01 - List and can be bought", async function () {
              await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
              const playerConnectedToMarketplace =
                  nftMarketplace.connect(player)
              await playerConnectedToMarketplace.buyItem(
                  basicNft.address,
                  TOKEN_ID,
                  { value: PRICE }
              )

              const newOwner = await basicNft.ownerOf(TOKEN_ID)
              const deployerProceeds = await nftMarketplace.getProceeds(
                  deployer.address
              )
              assert(newOwner.toString() == player.address)
              assert(deployerProceeds.toString() == PRICE.toString())
          })
      })
