const { network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")


module.exports = async({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()


    const basicNft = await deploy("BasicNFT", {

        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    log("BasicNFT Deployed...!")

    log("--------------------------------------------")


    if(!devNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {

        await verify(basicNft.address, [])
    }
}   


module.exports.tags = ["all", "basicNft", "main"]