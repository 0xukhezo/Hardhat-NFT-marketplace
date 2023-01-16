const { network, deployments, ethers } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0

async function buyItem() {
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
        "BasicNft",
        basicNftContractAddress.BasicNft.address,
        deployer
    )

    console.log("Getting price...")
    const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
    const price = listing.price.toString()
    console.log("Buying NFT...")
    const buyTx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
        value: price,
    })
    await buyTx.wait(1)
    console.log("Bought NFT!")

    if (network.config.chainId == 31337) {
        await moveBlocks(1, (sleepAmount = 1000))
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
