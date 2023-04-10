const { network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const factory = await ethers.getContract("TokenFactory");
  const args = [factory.address];

  const bridge = await deploy("Bridge", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  console.log("Bridge deployed " + bridge.address);
};

module.exports.tags = ["all", "bridge"];
