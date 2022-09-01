const { ethers } = require("hardhat")
const { devNetworks } = require("../helper-hardhat-config")


module.exports = async({ getNamedAccounts }) => {

    const { deployer } = await getNamedAccounts()

    // BasicNFT - Minting

    const basicNft = await ethers.getContract("BasicNFT", deployer)

    const basicNftMintTx = await basicNft.mintNft()

    await basicNftMintTx.wait(1)

    console.log(`Basic NFT Minted and The Token URI is : ${await basicNft.tokenURI(0)}`)


    // RandomIPFSNFT - Minting

    const randomIpfsNft = await ethers.getContract("RandomIPFSNFT", deployer)

    const mintFee = await randomIpfsNft.getMintFee()


    await new Promise(async(resolve, reject) => {

        setTimeout(resolve, 500000)

        randomIpfsNft.once("NFTMinted", async() => {

            resolve()
        })

        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({value: mintFee})

        const mintTxReceipt = await randomIpfsNftMintTx.wait(1)

        if(devNetworks.includes(network.name)) {

            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)

            const requestId = mintTxReceipt.events[1].args.requestId

            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })

    console.log(`Random IPFS NFT Minted and The Token URI is : ${await randomIpfsNft.tokenURI(0)}`)


    // DynamicSVGNFT - Minting

    const dynamicSvgNft = await ethers.getContract("DynamicSVGNFT", deployer)

    const highValue = ethers.utils.parseEther("100")

    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)

    await dynamicSvgNftMintTx.wait(1)

    console.log(`Dynamic SVG NFT Minted and The Token URI is : ${await dynamicSvgNft.tokenURI(0)}`)
}


module.exports.tags = ["all", "mint"]