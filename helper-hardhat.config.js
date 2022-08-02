const networks = {
    4: {
        name: "rinkeby",
        vrfCoordinatorAddress: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: 9382,
    },
    31337: {
        name: "localhost",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    }
}

const localChains = ["localhost", "hardhat"];

module.exports = {
    networks,
    localChains,
};