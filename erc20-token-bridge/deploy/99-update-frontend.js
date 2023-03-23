const { ethers, network } = require("hardhat");
const fs = require("fs");

const FRONTEND_ETH_BRIDGE_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/EthBridge/contractAddresses.json";
const FRONTEND_ETH_BRIDGE_ABI_FILE =
  "../erc20-token-bridge-ui/constants/EthBridge/abi.json";

const FRONTEND_MATIC_BRIDGE_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/MaticBridge/contractAddresses.json";
const FRONTEND_MATIC_BRIDGE_ABI_FILE =
  "../erc20-token-bridge-ui/constants/MaticBridge/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONTEND) {
    await updateEthBridgeContractAddresses();
    await updateEthBridgeAbi();

    await updateMaticBridgeContractAddresses();
    await updateEthBridgeAbi();
  }
};

async function updateEthBridgeContractAddresses() {
  const ethBridge = await ethers.getContract("BridgeEth");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_ETH_BRIDGE_ADDRESSES_FILE, "utf8")
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
    FRONTEND_ETH_BRIDGE_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );
}

async function updateMaticBridgeContractAddresses() {
  const maticBridge = await ethers.getContract("BridgeMatic");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_MATIC_BRIDGE_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(maticBridge.address)) {
      currentAddresses[chainId].push(maticBridge.address);
    }
  }

  {
    currentAddresses[chainId] = maticBridge.address;
  }
  fs.writeFileSync(
    FRONTEND_MATIC_BRIDGE_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );
}

async function updateEthBridgeAbi() {
  const ethBridge = await ethers.getContract("BridgeEth");
  fs.writeFileSync(
    FRONTEND_ETH_BRIDGE_ABI_FILE,
    ethBridge.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateEthBridgeAbi() {
  const maticBridge = await ethers.getContract("BridgeMatic");
  fs.writeFileSync(
    FRONTEND_MATIC_BRIDGE_ABI_FILE,
    maticBridge.interface.format(ethers.utils.FormatTypes.json)
  );
}

module.exports.tags = ["all", "frontend"];
