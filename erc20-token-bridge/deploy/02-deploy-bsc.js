const { ethers } = require("hardhat");
const fs = require("fs-extra");

module.exports = async function () {
  const chainId = network.config.chainId;

  if (chainId == 97) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const bridgeBscContractFactory = new ethers.ContractFactory(
      bridgeBscAbi,
      bridgeBscBin,
      wallet
    );
    const bridgeBsc = await bridgeBscContractFactory.deploy();
    console.log("Binance Smart Chain Bridge deployed");
    console.log(bridgeBsc.address);
  }
};

module.exports.tags = ["all", "bsc"];
