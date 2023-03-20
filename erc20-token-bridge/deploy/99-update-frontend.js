const { ethers, network } = require("hardhat");
const fs = require("fs");

const FRONTEND_BRIDGE_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/EthBridge/contractAddresses.json";
const FRONTEND_BRIDGE_ABI_FILE =
  "../erc20-token-bridge-ui/constants/EthBridge/abi.json";

const FRONTEND_TOKEN_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/TokenUSDC/contractAddresses.json";
const FRONTEND_TOKEN_ABI_FILE =
  "../erc20-token-bridge-ui/constants/TokenUSDC/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONTEND) {
    await updateBridgeContractAddresses();
    await updateBridgeAbi();

    await updateTokenContractAddresses();
    await updateTokenAbi();
  }
};

async function updateBridgeContractAddresses() {
  const ethBridge = await ethers.getContract("BridgeEth");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_BRIDGE_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(ethBridge.address)) {
      currentAddresses[chainId].push(ethBridge.address);
    }
  }

  {
    currentAddresses[chainId] = ethBridge.address;
  }
  fs.writeFileSync(
    FRONTEND_BRIDGE_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );
}

async function updateTokenContractAddresses() {
  const tokenUSDC = await ethers.getContract("TokenUSDC");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_TOKEN_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(tokenUSDC.address)) {
      currentAddresses[chainId].push(tokenUSDC.address);
    }
  }

  {
    currentAddresses[chainId] = tokenUSDC.address;
  }
  fs.writeFileSync(
    FRONTEND_TOKEN_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );
}

async function updateBridgeAbi() {
  const ethBridge = await ethers.getContract("BridgeEth");
  fs.writeFileSync(
    FRONTEND_BRIDGE_ABI_FILE,
    ethBridge.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateTokenAbi() {
  const tokenUSDC = await ethers.getContract("TokenUSDC");
  fs.writeFileSync(
    FRONTEND_TOKEN_ABI_FILE,
    tokenUSDC.interface.format(ethers.utils.FormatTypes.json)
  );
}

module.exports.tags = ["all", "frontend"];
