const { ethers } = require("hardhat");
const fs = require("fs-extra");

module.exports = async function () {
  const chainId = network.config.chainId;

  if (chainId == 97) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const bridgeBscAbi = fs.readFileSync(
      "./data/Bridge/BridgeBsc/BridgeBsc_sol_BridgeBsc.abi",
      "utf-8"
    );
    const bridgeBscBin = fs.readFileSync(
      "./data/Bridge/BridgeBsc/BridgeBsc_sol_BridgeBsc.bin",
      "utf-8"
    );

    const bridgeBscContractFactory = new ethers.ContractFactory(
      bridgeBscAbi,
      bridgeBscBin,
      wallet
    );
    const bridgeBsc = await bridgeBscContractFactory.deploy();
    console.log("Binance Smart Chain Bridge deployed");
    console.log(bridgeBsc.address);

    const tokenUsdcAbi = fs.readFileSync(
      "./data/Token/TokenUSDC/TokenUSDC_sol_TokenUSDC.abi",
      "utf-8"
    );
    const tokenUsdcBin = fs.readFileSync(
      "./data/Token/TokenUSDC/TokenUSDC_sol_TokenUSDC.bin",
      "utf-8"
    );

    const tokenUsdcContractFactory = new ethers.ContractFactory(
      tokenUsdcAbi,
      tokenUsdcBin,
      wallet
    );
    const tokenUsdc = await tokenUsdcContractFactory.deploy();
    console.log("Token USDC deployed");
    console.log(tokenUsdc.address);
    let tx = await tokenUsdc.functions.updateAdmin(bridgeBsc.address);
    await tx.wait(1);

    const tokenSharkAbi = fs.readFileSync(
      "./data/Token/TokenShark/TokenShark_sol_TokenShark.abi",
      "utf-8"
    );
    const tokenSharkBin = fs.readFileSync(
      "./data/Token/TokenShark/TokenShark_sol_TokenShark.bin",
      "utf-8"
    );

    const tokenSharkContractFactory = new ethers.ContractFactory(
      tokenSharkAbi,
      tokenSharkBin,
      wallet
    );
    const tokenShark = await tokenSharkContractFactory.deploy();
    console.log("Token Shark deployed");
    console.log(tokenShark.address);
    tx = await tokenShark.functions.updateAdmin(bridgeBsc.address);
    await tx.wait(1);
  }
};

module.exports.tags = ["all", "bsc"];
