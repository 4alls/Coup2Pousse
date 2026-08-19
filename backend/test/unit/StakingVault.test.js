const { assert, expect } = require("chai");
const { ethers } = require('hardhat');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Test StakingVault Contract", function () {
    let USDCToken;
    let Vault;
    let owner, addr1, controller;

    const REWARD_RATE_DIVISOR = 1n;

    beforeEach(async function () {
        [owner, addr1, controller] = await ethers.getSigners();
        let USDCTokenContract = await ethers.getContractFactory('USDC');
        USDCToken = await USDCTokenContract.deploy();
        let StakingVaultContract = await ethers.getContractFactory('StakingVault');
        Vault = await StakingVaultContract.deploy(USDCToken.target, "Staked USDC", "sUSDC", REWARD_RATE_DIVISOR);
        await USDCToken.approve(Vault.target, ethers.MaxUint256);
    })

    describe('Initialisation', function () {
        it('should set the underlying asset', async function () {
            expect(await Vault.asset()).to.equal(USDCToken.target);
        })

        it('should set the shares name and symbol', async function () {
            expect(await Vault.name()).to.equal("Staked USDC");
            expect(await Vault.symbol()).to.equal("sUSDC");
        })

        it('should set the deployer as the factory', async function () {
            expect(await Vault.factory()).to.equal(owner.address);
        })

        it('should set the reward rate divisor', async function () {
            expect(await Vault.rewardRateDivisor()).to.equal(REWARD_RATE_DIVISOR);
        })
    })

    describe('setRewardsController', function () {
        it('should NOT set the rewards controller if not called by the factory', async function () {
            await expect(
                Vault.connect(addr1).setRewardsController(controller.address)
            ).to.be.revertedWith("Not the factory");
        })

        it('should NOT set the rewards controller to address 0', async function () {
            await expect(
                Vault.setRewardsController(ethers.ZeroAddress)
            ).to.be.revertedWith("Address 0");
        })

        it('should set the rewards controller and emit an event', async function () {
            await expect(Vault.setRewardsController(controller.address))
                .to.emit(Vault, "RewardsControllerUpdated")
                .withArgs(controller.address);
            expect(await Vault.rewardsController()).to.equal(controller.address);
        })
    })

    describe('deposit and withdraw (ERC4626)', function () {
        it('should mint shares 1:1 on first deposit', async function () {
            await Vault.deposit(1000n, owner.address);
            expect(await Vault.balanceOf(owner.address)).to.equal(1000n);
            expect(await Vault.totalAssets()).to.equal(1000n);
            expect(await USDCToken.balanceOf(Vault.target)).to.equal(1000n);
        })

        it('should withdraw the underlying asset and burn shares', async function () {
            await Vault.deposit(1000n, owner.address);
            await Vault.withdraw(400n, owner.address, owner.address);
            expect(await Vault.balanceOf(owner.address)).to.equal(600n);
            expect(await USDCToken.balanceOf(Vault.target)).to.equal(600n);
        })
    })

    describe('reward accrual', function () {
        it('should accrue reward basis proportionally to time and staked amount', async function () {
            const amount = 1000n;
            const depositTx = await Vault.deposit(amount, owner.address);
            const depositReceipt = await depositTx.wait();
            const t0 = BigInt((await ethers.provider.getBlock(depositReceipt.blockNumber)).timestamp);

            await time.increase(1000);
            const now = BigInt(await time.latest());

            const basis = await Vault.pendingRewardBasis(owner.address);
            expect(basis).to.equal((now - t0) * amount / REWARD_RATE_DIVISOR);
        })

        it('should return 0 for an account that never staked', async function () {
            expect(await Vault.pendingRewardBasis(addr1.address)).to.equal(0n);
        })

        it('should reduce future accrual after a partial withdraw', async function () {
            const amount = 1000n;
            const depositTx = await Vault.deposit(amount, owner.address);
            const depositReceipt = await depositTx.wait();
            const t0 = BigInt((await ethers.provider.getBlock(depositReceipt.blockNumber)).timestamp);

            await time.increase(100);

            const withdrawTx = await Vault.withdraw(400n, owner.address, owner.address);
            const withdrawReceipt = await withdrawTx.wait();
            const t1 = BigInt((await ethers.provider.getBlock(withdrawReceipt.blockNumber)).timestamp);

            await time.increase(200);
            const now = BigInt(await time.latest());

            const expectedBasis = (t1 - t0) * amount + (now - t1) * 600n;
            expect(await Vault.pendingRewardBasis(owner.address)).to.equal(expectedBasis);
        })

        it('should settle and reset the reward basis, only callable by the rewards controller', async function () {
            await Vault.setRewardsController(controller.address);

            await Vault.deposit(1000n, owner.address);
            await time.increase(500);

            await expect(
                Vault.connect(addr1).settleRewardBasis(owner.address)
            ).to.be.revertedWith("Not the rewards controller");

            await Vault.connect(controller).settleRewardBasis(owner.address);
            expect(await Vault.pendingRewardBasis(owner.address)).to.equal(0n);
        })

        it('should settle rewards for both parties on a direct transfer of shares', async function () {
            const amount = 1000n;
            const depositTx = await Vault.deposit(amount, owner.address);
            const depositReceipt = await depositTx.wait();
            const t0 = BigInt((await ethers.provider.getBlock(depositReceipt.blockNumber)).timestamp);

            await time.increase(200);

            const transferTx = await Vault.transfer(addr1.address, amount);
            const transferReceipt = await transferTx.wait();
            const t1 = BigInt((await ethers.provider.getBlock(transferReceipt.blockNumber)).timestamp);

            expect(await Vault.pendingRewardBasis(owner.address)).to.equal((t1 - t0) * amount);

            await time.increase(300);
            const now = BigInt(await time.latest());

            expect(await Vault.pendingRewardBasis(owner.address)).to.equal((t1 - t0) * amount);
            expect(await Vault.pendingRewardBasis(addr1.address)).to.equal((now - t1) * amount);
        })
    })
})
