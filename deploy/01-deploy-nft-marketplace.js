const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = []

    log("------------------------------------")

    const NftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("------------------------------------")
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API
    ) {
        log("------------------------------------")
        log("Verifying...")
        await verify(NftMarketplace.address, [])
    }
}

module.exports.tags = ["all", "NftMarketplace"]
