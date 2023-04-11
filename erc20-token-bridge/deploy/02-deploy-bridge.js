const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [];

  const bridge = await deploy("Bridge", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  console.log("Bridge deployed " + bridge.address);
};

module.exports.tags = ["all", "bridge"];
