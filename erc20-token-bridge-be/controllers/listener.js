const { bridgeAddresses, bridgeAbi } = require("../constants/Bridge");
const { ethers } = require("ethers");
const Transfer = require("../models/Transfer");

const ethProvider = new ethers.providers.JsonRpcProvider(
  "http://127.0.0.1:8545/"
);
const polygonProvider = new ethers.providers.JsonRpcProvider(
  "http://127.0.0.1:8545/"
);

const ethBridge = new ethers.Contract(
  bridgeAddresses[31337][0],
  bridgeAbi,
  ethProvider
);

const polygonBridge = new ethers.Contract(
  bridgeAddresses[31337][1],
  bridgeAbi,
  polygonProvider
);

const listener = async () => {
  await ethBridge.on(
    "Deposit",
    async (from, to, token, targetBridge, amount, blockNumber) => {
      console.log(blockNumber);

      const data = {
        from: from,
        to: to,
        token: token,
        targetBridge: targetBridge,
        amount: amount,
        isClaimed: false,
      };

      const transfer = new Transfer(data);
      await transfer.save();
    }
  );

  await polygonBridge.on(
    "Deposit",
    async (from, to, token, targetBridge, amount, blockNumber) => {
      console.log(blockNumber);

      const data = {
        from: from,
        to: to,
        token: token,
        targetBridge: targetBridge,
        amount: amount,
        isClaimed: false,
      };

      const transfer = new Transfer(data);
      await transfer.save();
    }
  );
};

module.exports = listener;
