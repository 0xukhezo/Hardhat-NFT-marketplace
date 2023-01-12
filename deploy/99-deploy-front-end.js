const { network } = require("hardhat")
const fs = require("fs")

const FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH =
    "../Hardhat-NFT-web/constants/networkMapping.json"
const FRONT_END_NFTMARKETPLACE_ABI_FILE_PATH =
    "../Hardhat-NFT-web/constants/marketplaceAbi.json"

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

    const DEPLOYED_MARKETPLACE_ADDRESS_FILE_MARKETPLACE = `deployments/${chainIdNetwork}/NftMarketplace.json`

    const nftMarketplaceContractDeployedAddress = JSON.parse(
        fs.readFileSync(DEPLOYED_MARKETPLACE_ADDRESS_FILE_MARKETPLACE, "utf8")
    )

    const nftMarketplaceContractAddresses = JSON.parse(
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
    fs.writeFileSync(
        FRONT_END_NFTMARKETPLACE_ADDRESSES_FILE_PATH,
        JSON.stringify(nftMarketplaceContractAddresses)
    )
}
module.exports.tags = ["all", "frontend"]
