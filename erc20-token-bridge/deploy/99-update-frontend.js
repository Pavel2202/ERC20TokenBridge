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

const FRONTEND_BSC_BRIDGE_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/BscBridge/contractAddresses.json";
const FRONTEND_BSC_BRIDGE_ABI_FILE =
  "../erc20-token-bridge-ui/constants/BscBridge/abi.json";

const FRONTEND_TOKEN_USDC_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/TokenUsdc/contractAddresses.json";
const FRONTEND_TOKEN_USDC_ABI_FILE =
  "../erc20-token-bridge-ui/constants/TokenUsdc/abi.json";

const FRONTEND_TOKEN_SHARK_ADDRESSES_FILE =
  "../erc20-token-bridge-ui/constants/TokenShark/contractAddresses.json";
const FRONTEND_TOKEN_SHARK_ABI_FILE =
  "../erc20-token-bridge-ui/constants/TokenShark/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONTEND) {
    await updateEthBridge();
    await updateMaticBridge();
    await updateBscBridge();
    await updateTokenUsdc();
    await updateTokenShark();
  }
};

async function updateEthBridge() {
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

  fs.writeFileSync(
    FRONTEND_ETH_BRIDGE_ABI_FILE,
    ethBridge.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateMaticBridge() {
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

  fs.writeFileSync(
    FRONTEND_MATIC_BRIDGE_ABI_FILE,
    maticBridge.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateBscBridge() {
  const bscBridge = await ethers.getContract("BridgeBsc");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_BSC_BRIDGE_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(bscBridge.address)) {
      currentAddresses[chainId].push(bscBridge.address);
    }
  }

  {
    currentAddresses[chainId] = bscBridge.address;
  }
  fs.writeFileSync(
    FRONTEND_BSC_BRIDGE_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );

  fs.writeFileSync(
    FRONTEND_BSC_BRIDGE_ABI_FILE,
    bscBridge.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateTokenUsdc() {
  const tokenUsdc = await ethers.getContract("TokenUSDC");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_TOKEN_USDC_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(tokenUsdc.address)) {
      currentAddresses[chainId].push(tokenUsdc.address);
    }
  }

  {
    currentAddresses[chainId] = tokenUsdc.address;
  }
  fs.writeFileSync(
    FRONTEND_TOKEN_USDC_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );

  fs.writeFileSync(
    FRONTEND_TOKEN_USDC_ABI_FILE,
    tokenUsdc.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateTokenShark() {
  const tokenShark = await ethers.getContract("TokenShark");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_TOKEN_SHARK_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(tokenShark.address)) {
      currentAddresses[chainId].push(tokenShark.address);
    }
  }

  {
    currentAddresses[chainId] = tokenShark.address;
  }
  fs.writeFileSync(
    FRONTEND_TOKEN_SHARK_ADDRESSES_FILE,
    JSON.stringify(currentAddresses)
  );

  fs.writeFileSync(
    FRONTEND_TOKEN_SHARK_ABI_FILE,
    tokenShark.interface.format(ethers.utils.FormatTypes.json)
  );
}

module.exports.tags = ["all", "frontend"];
