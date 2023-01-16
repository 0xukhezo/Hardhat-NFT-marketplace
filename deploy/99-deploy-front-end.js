const { network } = require("hardhat")
const fs = require("fs")

const FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH =
    "../Hardhat-NFT-web/constants/networkMapping.json"
const FRONT_END_NFTMARKETPLACE_ABI_FILE_PATH =
    "../Hardhat-NFT-web/constants/marketplaceAbi.json"
const FRONT_END_BASICNFT_ABI_FILE_PATH =
    "../Hardhat-NFT-web/constants/basicNftAbi.json"

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplace = await artifacts.readArtifact("NftMarketplace")
    fs.writeFileSync(
        FRONT_END_NFTMARKETPLACE_ABI_FILE_PATH,
        JSON.stringify(nftMarketplace.abi)
    )
    const basicNft = await artifacts.readArtifact("BasicNft")
    fs.writeFileSync(
        FRONT_END_BASICNFT_ABI_FILE_PATH,
        JSON.stringify(basicNft.abi)
    )
}

async function updateContractAddresses() {
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
    const DEPLOYED_BASICNFT_ADDRESS_FILE = `deployments/${chainIdNetwork}/BasicNft.json`

    const nftMarketplaceContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_MARKETPLACE_ADDRESS_FILE, "utf8")
    )
    const basicNftContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_BASICNFT_ADDRESS_FILE, "utf8")
    )

    const nftMarketplaceContractAddresses = JSON.parse(
        fs.readFileSync(FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH, "utf8")
    )
    const basicNftContractAddresses = JSON.parse(
        fs.readFileSync(FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH, "utf8")
    )

    if (chainId in nftMarketplaceContractAddresses) {
        if (
            !nftMarketplaceContractAddresses[chainId][
                "nftMarketplace"
            ].includes(nftMarketplaceContractDeployedAddress.address)
        ) {
            nftMarketplaceContractAddresses[chainId]["nftMarketplace"].push(
                nftMarketplaceContractDeployedAddress.address
            )
        }
    } else {
        nftMarketplaceContractAddresses[chainId] = {
            NftMarketplace: [nftMarketplaceContractDeployedAddress.address],
        }
    }

    if (chainId in basicNftContractAddresses) {
        if (
            !basicNftContractAddresses[chainId]["basicNft"].includes(
                nftMarketplaceContractDeployedAddress.address
            )
        ) {
            basicNftContractAddresses[chainId]["basicNft"].push(
                nftMarketplaceContractDeployedAddress.address
            )
        }
    } else {
        basicNftContractAddresses[chainId] = {
            NftMarketplace: [nftMarketplaceContractDeployedAddress.address],
        }
    }
    fs.writeFileSync(
        FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH,
        JSON.stringify(nftMarketplaceContractAddresses)
    )
    fs.writeFileSync(
        FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH,

        JSON.stringify(basicNftContractAddresses)
    )
}
module.exports.tags = ["all", "frontend"]
