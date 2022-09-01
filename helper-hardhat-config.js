const { ethers } = require("hardhat")

const networkConfig = {

    4: {
        name: "rinkeby",
        vrfCoordinatorV2Address: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        mintFee: ethers.utils.parseEther("0.02"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "8906",
        callbackGasLimit: "500000",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    },

    31337: {
        name: "hardhat",
        vrfCoordinatorV2Address: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        mintFee: ethers.utils.parseEther("0.02"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000"
    }
}



const devNetworks = ["hardhat", "localhost"]



module.exports = {
    networkConfig,
    devNetworks
}