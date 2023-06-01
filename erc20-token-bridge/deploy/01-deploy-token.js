const { network, ethers } = require("hardhat");
const {
  abi,
  bytecode,
} = require("../artifacts/contracts/Token.sol/Token.json");

module.exports = async () => {
  const chainId = network.config.chainId;

  if (chainId == 11155111) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const Token = await ethers.getContractFactory("Token", wallet);
    const token = await Token.deploy("TokenShark", "SHARK", "0xf739403058D49D2B5c37DB58e788D32181aD0033");
    await token.deployed();

    console.log("Token deployed on Sepolia: " + token.address);
  }
};

module.exports.tags = ["all", "token"];
