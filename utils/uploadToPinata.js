const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()


const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET

const pinata = pinataSDK(pinataApiKey, pinataApiSecret)


async function storeNft(nftFilePath) {

    const fullNftFilePath = path.resolve(nftFilePath)

    const nfts = fs.readdirSync(fullNftFilePath)

    let responses = []

    console.log("Uploading to Pinata......")

    for(nftIndex in nfts) {

        const readableStreamForNftFiles = fs.createReadStream(`${fullNftFilePath}/${nfts[nftIndex]}`)

        try{

            const response = await pinata.pinFileToIPFS(readableStreamForNftFiles)

            responses.push(response)

        } catch(error){

            console.log(error)
        }
    }

    return {responses, nfts}
}


async function storeSmiliesTokenURIsMetadata(metadata) {

    try{

        const response = await pinata.pinJSONToIPFS(metadata)

        return response

    } catch(error){

        console.log(error)
    }

    return null
}


module.exports = { storeNft, storeSmiliesTokenURIsMetadata }