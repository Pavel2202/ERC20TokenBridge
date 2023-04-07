module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    const limeToken = await deploy("LimeToken", {
      from: deployer,
      args: [2],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    console.log("Lime token deployed " + limeToken.address);

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
