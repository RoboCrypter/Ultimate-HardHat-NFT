const { network, ethers } = require("hardhat")
const { devNetworks, networkConfig } = require("../helper-hardhat-config")
const fs = require("fs")
const { verify } = require("../utils/verify")



module.exports = async({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId


    let ethUsdPriceFeedAddress


    if(devNetworks.includes(network.name)) {

        const mockV3Aggregator = await ethers.getContract("MockV3Aggregator")

        ethUsdPriceFeedAddress = mockV3Aggregator.address

    } else{

        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }



    const lowSVG = fs.readFileSync("./NFTs/Smilies-Club-SVG/Sad-Smilie.svg", {encoding: "utf8"})

    const highSVG = fs.readFileSync("./NFTs/Smilies-Club-SVG/Excited-Smilie.svg", {encoding: "utf8"})

    

    const arguments = [ethUsdPriceFeedAddress, lowSVG, highSVG]



    const dynamicSvgNft = await deploy("DynamicSVGNFT", {

        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    log("DynamicSVGNFT Deployed...!")

    log("--------------------------------------------")


    if(!devNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {

        await verify(dynamicSvgNft.address, arguments)
    }
}



module.exports.tags = ["all", "dynamicSvgNft", "main"]