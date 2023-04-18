const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const bridge = await deploy("Bridge", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    console.log("TestBridge deployed " + bridge.address);

    const token = await deploy("Token", {
      from: deployer,
      args: ["SharkToken", "SHARK", deployer],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    console.log("TestToken deployed " + token.address);
  }
};

module.exports.tags = ["all", "test"];
