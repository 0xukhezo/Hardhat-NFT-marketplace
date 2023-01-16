const { network, ethers } = require("hardhat")
const fs = require("fs")

const { moveBlocks } = require("../utils/move-blocks")
const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const chainId = network.config.chainId.toString()
    let chainIdNetwork

    switch (chainId) {
        case "5":
            chainIdNetwork = "goerli"
            break
        default:
            chainIdNetwork = "localhost"
            break
    }

    const DEPLOYED_MARKETPLACE_ADDRESS_FILE = `deployments/${chainIdNetwork}/NftMarketplace.json`

    const nftMarketplaceContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_MARKETPLACE_ADDRESS_FILE, "utf8")
    ).address

    const DEPLOYED_BASICNFT_ADDRESS_FILE = `deployments/${chainIdNetwork}/BasicNft.json`

    const basicNftContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_BASICNFT_ADDRESS_FILE, "utf8")
    ).address

    const nftMarketplace = await ethers.getContractAt(
        "NftMarketplace",
        nftMarketplaceContractDeployedAddress,
        deployer
    )
    const randomNumber = Math.floor(Math.random() * 2)
    let basicNft
    if (randomNumber == 1) {
        basicNft = await ethers.getContractAt(
            "BasicNftTwo",
            basicNftContractDeployedAddress,
            deployer
        )
    } else {
        basicNft = await ethers.getContractAt(
            "BasicNft",
            basicNftContractDeployedAddress,
            deployer
        )
    }

    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId

    console.log("Approving NFT...")
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("NFT Listed!")
    if (network.config.chainId == 31337) {
        await moveBlocks(1, (sleepAmount = 1000))
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
