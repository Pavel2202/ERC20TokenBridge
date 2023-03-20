const { ethers } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  console.log(network.name);
  console.log(chainId);

  const tokenUsdc = await deploy("TokenUSDC", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("USDC token deployed " + tokenUsdc.address);

  const token = await ethers.getContract("TokenUSDC");
  await token.setAdmin(deployer);
  console.log(deployer);

  const maticBridge = await deploy("BridgeMatic", {
    from: deployer,
    args: [tokenUsdc.address],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  console.log("Matic bridge deployed " + maticBridge.address);

  const ethBridge = await deploy("BridgeEth", {
    from: deployer,
    args: [tokenUsdc.address],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  console.log("Eth bridge deployed " + ethBridge.address);
};

module.exports.tags = ["all", "bridge"];
