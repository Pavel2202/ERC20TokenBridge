module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    const tokenUsdc = await deploy("TokenUSDC", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    console.log("USDC token deployed " + tokenUsdc.address);

    const tokenShark = await deploy("TokenShark", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    console.log("Shark token deployed " + tokenShark.address);

    const ethBridge = await deploy("BridgeEth", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    console.log("Eth bridge deployed " + ethBridge.address);

    const bscBridge = await deploy("BridgeBsc", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    console.log("Bsc bridge deployed " + bscBridge.address);

    const polygonBridge = await deploy("BridgePolygon", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    console.log("Polygon bridge deployed " + polygonBridge.address);
  }
};

module.exports.tags = ["all", "hardhat"];
