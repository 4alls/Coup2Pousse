async function main() {
  console.log("Starting deployment...");
  const c2p = await hre.ethers.deployContract("C2PToken");
  await c2p.waitForDeployment();
  console.log(`C2PToken deployed to ${c2p.target}`);

  const usdc = await hre.ethers.deployContract("USDC");
  await usdc.waitForDeployment();
  console.log(`USDC deployed to ${usdc.target}`);

  const eth = await hre.ethers.deployContract("ETH");
  await eth.waitForDeployment();
  console.log(`ETH deployed to ${eth.target}`);

  const projectsFarm = await hre.ethers.deployContract("ProjectsFarm");
  await projectsFarm.waitForDeployment();
  console.log(`Projects Farm deployed to ${projectsFarm.target}`);

  const vaultFactory = await hre.ethers.deployContract("StakingVaultFactory");
  await vaultFactory.waitForDeployment();
  console.log(`Staking Vault Factory deployed to ${vaultFactory.target}`);

  let tx = await vaultFactory.createVault("Staked USDC", "sUSDC", usdc.target, 1);
  await tx.wait();
  const usdcVaultAddress = await vaultFactory.getVault(usdc.target);
  console.log(`USDC Staking Vault deployed to ${usdcVaultAddress}`);

  tx = await vaultFactory.createVault("Staked ETH", "sETH", eth.target, 2);
  await tx.wait();
  const ethVaultAddress = await vaultFactory.getVault(eth.target);
  console.log(`ETH Staking Vault deployed to ${ethVaultAddress}`);

  const staking = await hre.ethers.deployContract("Staking", [vaultFactory.target, usdc.target, c2p.target]);
  await staking.waitForDeployment();
  console.log(`Staking deployed to ${staking.target}`);

  tx = await vaultFactory.setRewardsController(usdc.target, staking.target);
  await tx.wait();
  tx = await vaultFactory.setRewardsController(eth.target, staking.target);
  await tx.wait();
  console.log(`Rewards controller set on both vaults`);

  const rewardsFunding = hre.ethers.parseUnits("100000", 18);
  tx = await c2p.transfer(staking.target, rewardsFunding);
  await tx.wait();
  console.log(`Funded Staking with ${hre.ethers.formatUnits(rewardsFunding, 18)} C2P for rewards`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
