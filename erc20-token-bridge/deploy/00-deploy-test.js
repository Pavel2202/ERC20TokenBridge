const { network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ethBridge = await deploy("EthBridge", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("EthBridge deployed " + ethBridge.address);

    const polygonBridge = await deploy("PolygonBridge", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    })

    console.log("PolygonBridge deployed " + polygonBridge.address);

    const token = await deploy("Token", {
      from: deployer,
      args: ["TokenShark", "SHARK", deployer],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    console.log("Token deployed " + token.address);
  }
};

module.exports.tags = ["all", "test"];
