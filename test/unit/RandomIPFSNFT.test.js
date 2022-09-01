const { expect } = require("chai")
const { getNamedAccounts, ethers, deployments, network } = require("hardhat")
const { devNetworks, networkConfig } = require("../../helper-hardhat-config")


!devNetworks.includes(network.name) ? describe.skip

: describe("Testing RandomIPFSNFT Contract", () => {


    let deployer, randomIpfsNft, vrfCoordinatorV2Mock

    const chainId = network.config.chainId
    

    beforeEach("Deploying RandomIPFSNFT Contract...", async() => {

        deployer = (await getNamedAccounts()).deployer

        await deployments.fixture(["all"])

        randomIpfsNft = await ethers.getContract("RandomIPFSNFT", deployer)

        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    })

    describe("constructor", () => {

        it("It should have the correct name and symbol", async() => {

            const name = await randomIpfsNft.name()

            const symbol = await randomIpfsNft.symbol()

            expect(name.toString()).to.equal("Smilies-Club")

            expect(symbol.toString()).to.equal("Smilie")
        })

        it("It should have a correct mint fee", async() => {

            const mintFee = await randomIpfsNft.getMintFee()

            expect(mintFee.toString()).to.equal(networkConfig[chainId]["mintFee"])
        })
    })

    describe("requestNft", () => {

        it("If mint fee is less than required amount, It should revert", async() => {

            await expect(randomIpfsNft.requestNft()).to.be.revertedWith("RandomIPFSNFT__LESS_THAN_MINT_FEE")
        })

        it("It should emits an event when NFT is Requested", async() => {

            const mintFee = await randomIpfsNft.getMintFee()

            await expect(randomIpfsNft.requestNft({value: mintFee})).to.emit(randomIpfsNft, "NFTRequested")
        })
    })

    describe("fulfillRandomWords", () => {

        it("It should mints an NFT after Request Id is generated", async() => {

            await new Promise(async(resolve, reject) => {

                randomIpfsNft.once("NFTMinted", async() => {

                    console.log("Found The Event: 'NFTMinted'")

                    try{

                        const tokenURI = await randomIpfsNft.getSmiliesTokenURIs("0")

                        const tokenCounter = await randomIpfsNft.getTokenCounter()

                        const nftBalanceAfterMinting = await randomIpfsNft.balanceOf(deployer)
                        

                        expect(tokenURI.toString().includes("ipfs://")).to.equal(true)

                        expect(tokenCounter.toString()).to.equal("1")

                        expect(nftBalanceAfterMinting.toString()).to.equal(nftBalanceBeforeMinting.add(1))


                        resolve()

                    } catch(error){

                        reject(error)
                    }
                })
                

                const nftBalanceBeforeMinting = await randomIpfsNft.balanceOf(deployer)

                const mintFee = await randomIpfsNft.getMintFee()

                const mintingNft = await randomIpfsNft.requestNft({value: mintFee})
    
                const txReceipt = await mintingNft.wait(1)
    
                await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, randomIpfsNft.address)
            })
        })
    })

    describe("getSmiliesFromModdedRng", () => {

        it("It should revert, If Numbers are out of Range", async() => {

            await expect(randomIpfsNft.getSmiliesFromModdedRng(999)).to.be.revertedWith("RandomIPFSNFT__RANGE_OUT_OF_BOUNDS")
        })
    })

    describe("withdraw", () => {

        it("It should revert, If withdraw is not called by Owner", async() => {

            const accounts = await ethers.getSigners()

            const notOwner = accounts[1]


            await expect(randomIpfsNft.connect(notOwner).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
})