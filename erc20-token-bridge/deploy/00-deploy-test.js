const { network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const tokenFactory = await deploy("TokenFactory", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("Factory deployed " + tokenFactory.address);

    const bridge = await deploy("Bridge", {
      from: deployer,
      args: [tokenFactory.address],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("Bridge deployed " + bridge.address);

    const token = await deploy("Token", {
      from: deployer,
      args: ["SharkToken", "SHARK", deployer],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    console.log("Token deployed " + token.address);
  }
};

module.exports.tags = ["all", "test"];
