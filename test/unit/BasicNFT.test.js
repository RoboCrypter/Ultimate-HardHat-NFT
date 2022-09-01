const { expect } = require("chai")
const { getNamedAccounts, ethers, deployments, network } = require("hardhat")
const { devNetworks } = require("../../helper-hardhat-config")


!devNetworks.includes(network.name) ? describe.skip

: describe("Testing BasicNFT Contract", () => {

    let deployer, basicNft


    beforeEach("Deploying BasicNFT Contract...", async() => {

        deployer = (await getNamedAccounts()).deployer

        await deployments.fixture(["all"])

        basicNft = await ethers.getContract("BasicNFT", deployer)
    })

    describe("constructor", () => {

        it("It should have the correct name and symbol of the contract", async() => {

            const name = await basicNft.name()

            const symbol = await basicNft.symbol()

            expect(name.toString()).to.equal("Smilies Collection")
            
            expect(symbol.toString()).to.equal("Smilie")
        })
    })

    describe("mintNft", () => {

        it("It should let other users mint NFT, and update the Token Counter accordingly", async() => {

            await basicNft.mintNft()

            const tokenUri = await basicNft.tokenURI(0)

            const updatedTokenCounter = await basicNft.getTokenCounter()

            expect(tokenUri).to.equal(await basicNft.TOKEN_URI())

            expect(updatedTokenCounter).to.equal(1)
        })
    })
})