require("hardhat-deploy");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();

const MNEMONIC = process.env.MNEMONIC;
const PASS_PHRASE = process.env.PASS_PHRASE;

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const BSCTESTNET_RPC_URL = process.env.BSCTESTNET_RPC_URL;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      chainId: 11155111,
      url: SEPOLIA_RPC_URL,
      blockConfirmations: 6,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: PASS_PHRASE,
      },
    },
    mumbai: {
      chainId: 80001,
      url: MUMBAI_RPC_URL,
      blockConfirmations: 6,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: PASS_PHRASE,
      },
    },
    bscTestnet: {
      chainId: 97,
      url: BSCTESTNET_RPC_URL,
      blockConfirmations: 6,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: PASS_PHRASE,
      },
    },
  },
  solidity: "0.8.19",
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
    receiver: {
      default: 1,
    },
  },
};