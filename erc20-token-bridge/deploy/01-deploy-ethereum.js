const { ethers } = require("hardhat");
const fs = require("fs-extra");

const FRONTEND_TOKEN_USDC_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/TokenUsdc/contractAddresses.json";
const FRONTEND_TOKEN_USDC_ABI_FILE =
  "../erc20-token-bridge-ui/constants/TokenUsdc/abi.json";

const FRONTEND_TOKEN_SHARK_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/TokenShark/contractAddresses.json";
const FRONTEND_TOKEN_SHARK_ABI_FILE =
  "../erc20-token-bridge-ui/constants/TokenShark/abi.json";

const FRONTEND_ETH_BRIDGE_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/EthBridge/contractAddresses.json";
const FRONTEND_ETH_BRIDGE_ABI_FILE =
  "../erc20-token-bridge-ui/constants/EthBridge/abi.json";

module.exports = async function () {
  const chainId = network.config.chainId;

  if (chainId == 11155111) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const bridgeEthAbi = fs.readFileSync(
      "./data/Bridge/BridgeEth/BridgeEth_sol_BridgeEth.abi",
      "utf-8"
    );
    const bridgeEthBin = fs.readFileSync(
      "./data/Bridge/BridgeEth/BridgeEth_sol_BridgeEth.bin",
      "utf-8"
    );

    const bridgeEthContractFactory = new ethers.ContractFactory(
      bridgeEthAbi,
      bridgeEthBin,
      wallet
    );
    const bridgeEth = await bridgeEthContractFactory.deploy();
    console.log("Ethereum Bridge deployed");
    console.log(bridgeEth.address);

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
    let tx = await tokenUsdc.functions.updateAdmin(bridgeEth.address);
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
    tx = await tokenShark.functions.updateAdmin(bridgeEth.address);
    await tx.wait(1);

    const usdcTokenCurrentAddresses = JSON.parse(
      fs.readFileSync(FRONTEND_TOKEN_USDC_ADDRESSES_FILE, "utf8")
    );
    usdcTokenCurrentAddresses[chainId] = tokenUsdc.address;
    fs.writeFileSync(
      FRONTEND_TOKEN_USDC_ADDRESSES_FILE,
      JSON.stringify(usdcTokenCurrentAddresses)
    );

    fs.writeFileSync(
      FRONTEND_TOKEN_USDC_ABI_FILE,
      tokenUsdc.interface.format(ethers.utils.FormatTypes.json)
    );

    const tokenSharkCurrentAddresses = JSON.parse(
      fs.readFileSync(FRONTEND_TOKEN_SHARK_ADDRESSES_FILE, "utf8")
    );
    tokenSharkCurrentAddresses[chainId] = tokenShark.address;
    fs.writeFileSync(
      FRONTEND_TOKEN_SHARK_ADDRESSES_FILE,
      JSON.stringify(tokenSharkCurrentAddresses)
    );

    fs.writeFileSync(
      FRONTEND_TOKEN_SHARK_ABI_FILE,
      tokenShark.interface.format(ethers.utils.FormatTypes.json)
    );

    const ethBridgeCurrentAddresses = JSON.parse(
      fs.readFileSync(FRONTEND_ETH_BRIDGE_ADDRESSES_FILE, "utf8")
    );
    ethBridgeCurrentAddresses[chainId] = bridgeEth.address;
    fs.writeFileSync(
      FRONTEND_ETH_BRIDGE_ADDRESSES_FILE,
      JSON.stringify(ethBridgeCurrentAddresses)
    );

    fs.writeFileSync(
      FRONTEND_ETH_BRIDGE_ABI_FILE,
      bridgeEth.interface.format(ethers.utils.FormatTypes.json)
    );
  }
};

module.exports.tags = ["all", "ethereum"];
