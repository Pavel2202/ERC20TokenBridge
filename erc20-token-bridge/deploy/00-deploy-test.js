const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const args = [];

    const ethereumBridge = await deploy("EthereumBridge", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    console.log("EthereumBridge deployed " + ethereumBridge.address);

    const polygonBridge = await deploy("PolygonBridge", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    console.log("PolygonBridge deployed " + polygonBridge.address);
  }
};

module.exports.tags = ["all", "test"];
