const { network, ethers } = require("hardhat")
const { devNetworks, networkConfig } = require("../helper-hardhat-config")
const { storeNft, storeSmiliesTokenURIsMetadata } = require("../utils/uploadToPinata")
const { verify } = require("../utils/verify")


const FUND_AMOUNT = ethers.utils.parseEther("10")

const NFTsFilePath = "../hardhat-nft/NFTs/Smilies-Club"

const metadataTemplate = {

    name: "",
    description: "",
    nft: "",
    attributes: [
        {
            trait_type: "Emoji",
            value: 999
        }
    ]
}

let smiliesTokenURIs = [

    "ipfs://QmSuDnADyiMeJuWUmFgpfHJcKUBoPdLsymTxFeJP9fzTkR",
    "ipfs://QmSe9Jj6vuXdAYJDmB9PoQWYaRkkS8jkso8QGFjQocN2FS",
    "ipfs://QmYyX56AEUfm8Hg9eX4vtcU1rpKXvQ9xu4UjanvMyTEkWK",
    "ipfs://QmNdxEhoCgCS6zypmbMZYUaJnWTzfELwZ6HBM7i5YFZ4Hg"
]



module.exports = async ({ getNamedAccounts, deployments }) => {
    
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId



    if(process.env.UPLOAD_TO_PINATA == "true") {

        smiliesTokenURIs = await handleSmiliesTokenURIs()
    }


    let vrfCoordinatorV2Address, subscriptionId


    if(devNetworks.includes(network.name)) {

        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")

        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const tx = await vrfCoordinatorV2Mock.createSubscription()

        const txReciept = await tx.wait(1)

        subscriptionId = txReciept.events[0].args.subId

        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)

    } else {

        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2Address"]

        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }



    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const mintFee = networkConfig[chainId]["mintFee"]


    const arguments = [vrfCoordinatorV2Address, subscriptionId, gasLane, callbackGasLimit, smiliesTokenURIs, mintFee]


    const randomIpfsNft = await deploy("RandomIPFSNFT", {

        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("RandomIPFSNFT Deployed...!")

    log("--------------------------------------------")


    if(!devNetworks.includes(network.name) && process.env.ETHERSCAN_API_KEY) {

        await verify(randomIpfsNft.address, arguments)
    }
}



async function handleSmiliesTokenURIs() {

    smiliesTokenURIs = []

    const { responses: nftUploadResponses, nfts } = await storeNft(NFTsFilePath)

    
    for(nftUploadResponseIndex in nftUploadResponses) {

        let smiliesTokenURIsMetadata = { ...metadataTemplate }


        smiliesTokenURIsMetadata.name = nfts[nftUploadResponseIndex].replace(".png", "")

        smiliesTokenURIsMetadata.description = `${smiliesTokenURIsMetadata.name}`

        smiliesTokenURIsMetadata.nft = `ipfs://${nftUploadResponses[nftUploadResponseIndex].IpfsHash}`

        console.log(`Uploading Metadata of NFT : ${smiliesTokenURIsMetadata.name}......`)


        const smiliesMetadataUploadResponse = await storeSmiliesTokenURIsMetadata(smiliesTokenURIsMetadata)

        smiliesTokenURIs.push(`ipfs://${smiliesMetadataUploadResponse.IpfsHash}`)
    }


    console.log("Smilies URIs Uploaded...!")

    console.log(smiliesTokenURIs)


    return smiliesTokenURIs
}



module.exports.tags = ["all", "randomIpfsNft", "main"]
