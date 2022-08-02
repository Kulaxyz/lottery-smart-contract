const { assert, expect } = require('chai');
const { deployments, getNamedAccounts, ethers, network } = require('hardhat');
const { localChains } = require('../../helper-hardhat.config.js');

!localChains.includes(network.name)
? describe.skip
: describe('Lottery', () => {
    let lottery, interval
    beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(['all']);
        lottery = await ethers.getContract('Lottery', deployer);
        interval = await lottery.callStatic.getInterval();
    })

    describe('checkUpkeep', () => {
        it('should fail if no users', async function () {
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]);
            await network.provider.send('evm_mine', []);

            const { performNeeded } = await lottery.callStatic.checkUpkeep("0x0");
            assert.equal(performNeeded, false);
        });

        it('should fail if no time', async function () {
            const { performNeeded } = await lottery.callStatic.checkUpkeep(deployer);
            assert.equal(performNeeded, false);
        });
    })
})