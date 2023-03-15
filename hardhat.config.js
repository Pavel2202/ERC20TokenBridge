require("hardhat-deploy");
require("dotenv").config();

const MNEMONIC = process.env.MNEMONIC;
const PASS_PHRASE = process.env.PASS_PHRASE;

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      chainId: 5,
      url: GOERLI_RPC_URL,
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
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
  solidity: "0.8.19",
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};
