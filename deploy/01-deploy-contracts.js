module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  console.log(network.name);
  const tokenUsdc = await deploy("TokenUSDC", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("USDC token deployed " + tokenUsdc.address);

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

  console.log("Goerli bridge deployed " + ethBridge.address);
};
