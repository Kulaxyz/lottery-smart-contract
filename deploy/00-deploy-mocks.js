const { network, deployments } =  require("hardhat")

module.exports = async ({ deployments, getNamedAccounts }) => {
    if (network.config.chainId === 31337) {
        const { deployer } = await getNamedAccounts()
        const BASE_FEE = "250000000000000000"
        const GAS_PRICE_LINK = 1e9

        await deployments.deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true,
            contract: "VRFCoordinatorV2Mock",
            waitConfirmations: network.config.blockConfirmations,
        })

        deployments.log("Deployed VRFCoordinatorV2Mock")
        deployments.log("----------------------------------------------------")
    }
};

module.exports.tags = ["all", "mocks", "development"]
