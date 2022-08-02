const { network, deployments, ethers } =  require("hardhat")
const { localChains, networks } = require("../helper-hardhat.config.js")
const { verify } = require("../utils/verify.js")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    let vrfCoordinatorAddress
    let subscriptionId

    if (localChains.includes(network.name)) {
        const vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorAddress = vrfCoordinator.address

        const transactionResponse = await vrfCoordinator.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId
    } else {
        vrfCoordinatorAddress = networks[network.config.chainId].vrfCoordinatorAddress
        subscriptionId = networks[network.config.chainId].subscriptionId
    }

    const args = [
        vrfCoordinatorAddress,
        ethers.utils.parseEther('0.005'),
        networks[network.config.chainId].keyHash,
        subscriptionId,
        30
    ]

    const lottery = await deployments.deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        contract: "Lottery",
        waitConfirmations: network.config.blockConfirmations,
    })

    deployments.log("Deployed Lottery contract")

    if (!localChains.includes(network.name)) {
        await verify(lottery.address, args)
        deployments.log("Verified Lottery contract")
    }
    deployments.log("----------------------------------------------------")
};