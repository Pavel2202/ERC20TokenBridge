const { ethers } = require("hardhat");

module.exports = async function () {
  const chainId = network.config.chainId;

  if (chainId == 11155111) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const bridgeEthContractFactory = new ethers.ContractFactory(
      bridgeEthAbi,
      bridgeEthBin,
      wallet
    );
    const bridgeEth = await bridgeEthContractFactory.deploy();
    console.log("Ethereum Bridge deployed");
    console.log(bridgeEth.address);
  }
};

module.exports.tags = ["all", "ethereum"];
