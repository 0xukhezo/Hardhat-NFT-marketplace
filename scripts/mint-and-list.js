const { ethers, network } = require("hardhat")
const fs = require("fs")

const price = ethers.utils.parseEther("0.1")

const mintAndlist = async () => {
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

    const DEPLOYED_MARKETPLACE_ADDRESS_FILE_BIOKOIN = `deployments/${chainIdNetwork}/NftMarketplace.json`
    const DEPLOYED_BASICNFT_ADDRESS_FILE_BIOKOIN = `deployments/${chainIdNetwork}/BasicNft.json`

    const nftMarketplaceContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_MARKETPLACE_ADDRESS_FILE_BIOKOIN, "utf8")
    )
    const basicNftContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_BASICNFT_ADDRESS_FILE_BIOKOIN, "utf8")
    )

    const nftMarketplace = await ethers.getContractAt(
        "NftMarketplace",
        nftMarketplaceContractDeployedAddress.address
    )
    const basicNft = await ethers.getContractAt(
        "BasicNft",
        basicNftContractDeployedAddress.address
    )

    console.log("Minting...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)

    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`Minting the NFT with ID: ${tokenId} finished`)

    const approveTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approveTx.wait(1)
    console.log("Listing...")
    const listingTx = await nftMarketplace.listItem(
        basicNft.address,
        tokenId,
        price
    )
    await listingTx.wait(1)
    console.log("Listing finished")
}

mintAndlist()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
