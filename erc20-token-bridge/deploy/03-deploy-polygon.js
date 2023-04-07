const { ethers } = require("hardhat");
const fs = require("fs-extra");

module.exports = async function () {
  const chainId = network.config.chainId;

  if (chainId == 80001) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const bridgePolygonContractFactory = new ethers.ContractFactory(
      bridgePolygonAbi,
      bridgePolygonBin,
      wallet
    );
    const bridgePolygon = await bridgePolygonContractFactory.deploy();
    console.log("Polygon Bridge deployed");
    console.log(bridgePolygon.address);
  }
};

module.exports.tags = ["all", "polygon"];
