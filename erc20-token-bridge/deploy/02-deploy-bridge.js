const { network, ethers } = require("hardhat");
const {
  abi,
  bytecode,
} = require("../artifacts/contracts/Bridge.sol/Bridge.json");

module.exports = async () => {
  const chainId = network.config.chainId;

  if (chainId == 11155111) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const bridgeFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    const bridge = await bridgeFactory.deploy();

    console.log("Bridge deployed " + bridge.address);
  }
};

module.exports.tags = ["all", "bridge"];
