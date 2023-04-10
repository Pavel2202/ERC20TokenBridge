const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = ["SharkToken", "SHARK", deployer];

  const token = await deploy("Token", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  console.log("Token deployed " + token.address);
};

module.exports.tags = ["all", "token"];