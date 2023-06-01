const { network } = require("hardhat");

module.exports = async () => {
  const chainId = network.config.chainId;

  if (chainId == 11155111) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const Bridge = await ethers.getContractFactory("Bridge", wallet);
    const bridge = await Bridge.deploy();
    await bridge.deployed();

    console.log("Bridge deployed on Sepolia: " + bridge.address);
  } else if (chainId == 80001) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.MUMBAI_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const Bridge = await ethers.getContractFactory("Bridge", wallet);
    const bridge = await Bridge.deploy();
    await bridge.deployed();

    console.log("Bridge deployed on Mumbai: " + bridge.address);
  }
};

module.exports.tags = ["all", "bridge"];
