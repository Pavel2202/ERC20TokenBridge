// const { artifacts } = require("hardhat");

// const TokenUSDC = artifacts.require("TokenUSDC.sol");
// const BridgeEth = artifacts.

module.exports = async function (deployer, network, addresses) {
    const tokenUsdc = await deploy("TokenUSDC");

    if (network == "mumbai") {
        tokenUsdc.mint(addresses[0], 1000);
        const maticBridge = await deploy("BridgeMatic");
        await tokenUsdc.updateAdmin(maticBridge.address);
    }
    if (network == "goerli") {
        const ethBridge = await deploy("BridgeEth");
        await tokenUsdc.updateAdmin(ethBridge.address);
    }
}