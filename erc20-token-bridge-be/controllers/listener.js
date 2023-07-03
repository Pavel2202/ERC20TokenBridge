require("dotenv").config();
const { bridgeAddresses, bridgeAbi } = require("../constants/Bridge");
const { ethers } = require("ethers");
const Transfer = require("../models/Transfer");

const ethProvider = new ethers.providers.JsonRpcProvider(
  process.env.SEPOLIA_RPC_URL
);
const polygonProvider = new ethers.providers.JsonRpcProvider(
  process.env.MUMBAI_RPC_URL
);

const ethBridge = new ethers.Contract(
  bridgeAddresses[11155111],
  bridgeAbi,
  ethProvider
);

const polygonBridge = new ethers.Contract(
  bridgeAddresses[80001],
  bridgeAbi,
  polygonProvider
);

const listener = async () => {
  await ethBridge.on("Locked", async (from, to, token, amount) => {
    const data = {
      from: from,
      to: to,
      token: token,
      wrappedToken: null,
      fromBridgeChainId: "11155111",
      fromBridge: "Sepolia",
      toBridgeChainId: "80001",
      toBridge: "Mumbai",
      amount: amount,
      isClaimed: false,
    };

    const transfer = new Transfer(data);
    await transfer.save();
  });

  await polygonBridge.on(
    "Burned",
    async (from, to, wrappedToken, token, amount) => {
      const data = {
        from: from,
        to: to,
        token: token,
        wrappedToken: wrappedToken,
        fromBridgeChainId: "80001",
        fromBridge: "Mumbai",
        toBridgeChainId: "11155111",
        toBridge: "Sepolia",
        amount: amount,
        isClaimed: false,
      };

      const transfer = new Transfer(data);
      await transfer.save();
    }
  );
};

module.exports = listener;
