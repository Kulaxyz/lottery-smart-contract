const { assert, expect } = require('chai');
const { deployments, getNamedAccounts, ethers, network } = require('hardhat');
const { localChains } = require('../../helper-hardhat.config.js');

!localChains.includes(network.name)
? describe.skip
: describe('Lottery', () => {
    let lottery, interval, deployer
    beforeEach(async () => {
        deployer = await getNamedAccounts().deployer
        await deployments.fixture(['all']);
        lottery = await ethers.getContract('Lottery', deployer);
        interval = await lottery.callStatic.getInterval();
    })

    describe('checkUpkeep', () => {
        it('should fail if no users', async function () {
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
            await network.provider.send('evm_mine', []);

            const {upkeepNeeded} = await lottery.callStatic.checkUpkeep([]);
            assert.equal(upkeepNeeded, false);
        });

        it('should fail if no time', async function () {
            const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
            assert.equal(upkeepNeeded, false);
        });
    })
})