const { network, deployments, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0

async function cancel() {
    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const nftMarketplaceContractAddress = await deployments.fixture([
        "NftMarketplace",
    ])
    const basicNftContractAddress = await deployments.fixture(["basicNft"])
    const nftMarketplace = await ethers.getContractAt(
        "NftMarketplace",
        nftMarketplaceContractAddress.NftMarketplace.address,
        deployer
    )
    const basicNft = await ethers.getContractAt(
        "BasicNftTwo",
        basicNftContractAddress.BasicNft.address,
        deployer
    )
    console.log("Canceling NFT...")
    const cancelTx = await nftMarketplace.cancelListing(
        basicNft.address,
        TOKEN_ID
    )
    await cancelTx.wait(1)
    console.log("NFT canceled...")

    if (network.config.chainId == 31337) {
        await moveBlocks(1, (sleepAmount = 1000))
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
