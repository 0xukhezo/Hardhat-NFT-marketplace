const { network } = require("hardhat")
const fs = require("fs")

const FRONT_END_ADDRESSES_FILE_PATH =
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

    const nftMarketplaceContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_MARKETPLACE_ADDRESS_FILE, "utf8")
    ).address

    const frontEndFile = JSON.parse(
        fs.readFileSync(FRONT_END_ADDRESSES_FILE_PATH, "utf8")
    )

    if (chainId in frontEndFile) {
        if (
            !frontEndFile[chainId]["NftMarketplace"].includes(
                nftMarketplaceContractDeployedAddress
            )
        ) {
            frontEndFile[chainId]["NftMarketplace"].push(
                nftMarketplaceContractDeployedAddress
            )
        }
    } else {
        frontEndFile[chainId] = {
            NftMarketplace: [nftMarketplaceContractDeployedAddress],
        }
    }
    fs.writeFileSync(
        FRONT_END_ADDRESSES_FILE_PATH,
        JSON.stringify(frontEndFile)
    )

    const DEPLOYED_BASICNFT_ADDRESS_FILE = `deployments/${chainIdNetwork}/BasicNft.json`

    const basicNftContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_BASICNFT_ADDRESS_FILE, "utf8")
    ).address

    if (chainId in frontEndFile) {
        if (
            !frontEndFile[chainId]["BasicNft"].includes(
                basicNftContractDeployedAddress
            )
        ) {
            frontEndFile[chainId]["BasicNft"].push(
                basicNftContractDeployedAddress
            )
        }
    }

    fs.writeFileSync(
        FRONT_END_ADDRESSES_FILE_PATH,
        JSON.stringify(frontEndFile)
    )
}
module.exports.tags = ["all", "frontend"]
