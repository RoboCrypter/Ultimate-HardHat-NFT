const { ethers, network } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")


const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9


const DECIMALS = 18
const INITIAL_ANSWER = ethers.utils.parseEther("200")


module.exports = async({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()


    if(devNetworks.includes(network.name)) {

        log("Dev_Networks Detected... Deploying Mocks...")

        await deploy("VRFCoordinatorV2Mock", {

            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true
        })

        await deploy("MockV3Aggregator", {

            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true
        })

        log("Mocks Deployed...!")

        log("--------------------------------------------")
    }
}


module.exports.tags = ["all", "mocks"]