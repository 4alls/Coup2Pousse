const { assert, expect } = require("chai");
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Test StakingVaultFactory and Staking Contracts", function () {
    let C2PToken;
    let USDCToken;
    let ETHToken;
    let Factory;
    let Staking;
    let MockFeed;
    let owner, addr1, addr2;

    const USDC_DIVISOR = 1n;
    const ETH_DIVISOR = 2n;
    const FEED_ANSWER = 200000000n; // 8 décimales => 2 USD

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        let C2PTokenContract = await ethers.getContractFactory('C2PToken');
        C2PToken = await C2PTokenContract.deploy();
        let USDCTokenContract = await ethers.getContractFactory('USDC');
        USDCToken = await USDCTokenContract.deploy();
        let ETHTokenContract = await ethers.getContractFactory('ETH');
        ETHToken = await ETHTokenContract.deploy();

        let FactoryContract = await ethers.getContractFactory('StakingVaultFactory');
        Factory = await FactoryContract.deploy();

        let StakingContract = await ethers.getContractFactory('Staking');
        Staking = await StakingContract.deploy(Factory.target, USDCToken.target, C2PToken.target);

        let MockFeedContract = await ethers.getContractFactory('MockV3Aggregator');
        MockFeed = await MockFeedContract.deploy(8, FEED_ANSWER);

        await C2PToken.transfer(Staking.target, ethers.parseUnits("1000", 18));
    })

    describe('StakingVaultFactory', function () {
        it('should NOT create a vault if not called by the owner', async function () {
            await expect(
                Factory.connect(addr1).createVault("Staked USDC", "sUSDC", USDCToken.target, USDC_DIVISOR)
            ).to.be.revertedWithCustomError(Factory, "OwnableUnauthorizedAccount");
        })

        it('should create a vault and register it', async function () {
            await expect(Factory.createVault("Staked USDC", "sUSDC", USDCToken.target, USDC_DIVISOR))
                .to.emit(Factory, "VaultCreated");
            expect(await Factory.getVault(USDCToken.target)).to.not.equal(ethers.ZeroAddress);
        })

        it('should NOT create a vault twice for the same token', async function () {
            await Factory.createVault("Staked USDC", "sUSDC", USDCToken.target, USDC_DIVISOR);
            await expect(
                Factory.createVault("Staked USDC", "sUSDC", USDCToken.target, USDC_DIVISOR)
            ).to.be.revertedWith("Vault already exists");
        })

        it('should NOT set a rewards controller for a token without a vault', async function () {
            await expect(
                Factory.setRewardsController(USDCToken.target, Staking.target)
            ).to.be.revertedWith("Vault does not exist");
        })
    })

    describe('Staking (rewards orchestrator)', function () {
        let USDCVault;
        let ETHVault;

        beforeEach(async function () {
            await Factory.createVault("Staked USDC", "sUSDC", USDCToken.target, USDC_DIVISOR);
            await Factory.createVault("Staked ETH", "sETH", ETHToken.target, ETH_DIVISOR);
            await Factory.setRewardsController(USDCToken.target, Staking.target);
            await Factory.setRewardsController(ETHToken.target, Staking.target);

            USDCVault = await ethers.getContractAt('StakingVault', await Factory.getVault(USDCToken.target));
            ETHVault = await ethers.getContractAt('StakingVault', await Factory.getVault(ETHToken.target));

            await USDCToken.approve(USDCVault.target, ethers.MaxUint256);
            await ETHToken.approve(ETHVault.target, ethers.MaxUint256);
        })

        it('should revert calculateRewards if the vault does not exist', async function () {
            await expect(
                Staking.calculateRewards(addr1.address, MockFeed.target)
            ).to.be.revertedWithCustomError(Staking, "VaultDoesNotExist");
        })

        it('should return 0 rewards for an account that never staked', async function () {
            expect(await Staking.connect(addr1).calculateRewards(ETHToken.target, MockFeed.target)).to.equal(0n);
        })

        it('should revert getRewardAndSupportProject if rewards are 0', async function () {
            await expect(
                Staking.connect(addr1).getRewardAndSupportProject(ETHToken.target, addr2.address, MockFeed.target)
            ).to.be.revertedWithCustomError(Staking, "NoRewards");
        })

        it('should calculate rewards in USD from the staked amount, elapsed time and Chainlink price', async function () {
            const amount = 1000n;
            const depositTx = await ETHVault.deposit(amount, owner.address);
            const depositReceipt = await depositTx.wait();
            const t0 = BigInt((await ethers.provider.getBlock(depositReceipt.blockNumber)).timestamp);

            await time.increase(1000);
            const now = BigInt(await time.latest());

            const expectedBasis = (now - t0) * amount / ETH_DIVISOR;
            const expectedPrice = FEED_ANSWER * 10n ** 10n / 10n ** 18n; // == 2
            const expectedRewards = expectedBasis * expectedPrice;

            expect(await Staking.calculateRewards(ETHToken.target, MockFeed.target)).to.equal(expectedRewards);
        })

        it('should split rewards 50/50 between the staker and the supported project, and settle the vault basis', async function () {
            const amount = 1000n;
            const depositTx = await ETHVault.deposit(amount, owner.address);
            const depositReceipt = await depositTx.wait();
            const t0 = BigInt((await ethers.provider.getBlock(depositReceipt.blockNumber)).timestamp);

            await time.increase(1000);

            const stakerBalanceBefore = await C2PToken.balanceOf(owner.address);
            const projectBalanceBefore = await C2PToken.balanceOf(addr2.address);

            const claimTx = await Staking.getRewardAndSupportProject(ETHToken.target, addr2.address, MockFeed.target);
            const claimReceipt = await claimTx.wait();
            const t1 = BigInt((await ethers.provider.getBlock(claimReceipt.blockNumber)).timestamp);

            const expectedBasis = (t1 - t0) * amount / ETH_DIVISOR;
            const expectedPrice = FEED_ANSWER * 10n ** 10n / 10n ** 18n;
            const expectedRewards = expectedBasis * expectedPrice;

            const stakerBalanceAfter = await C2PToken.balanceOf(owner.address);
            const projectBalanceAfter = await C2PToken.balanceOf(addr2.address);

            expect(stakerBalanceAfter - stakerBalanceBefore).to.equal(expectedRewards / 2n);
            expect(projectBalanceAfter - projectBalanceBefore).to.equal(expectedRewards / 2n);
            expect(await ETHVault.pendingRewardBasis(owner.address)).to.equal(0n);
        })
    })
})
