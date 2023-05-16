const express = require("express");
const databaseConfig = require("./config/database");
const routesConfig = require("./config/routes");
const { bridgeAddress, bridgeAbi } = require("./constants/Bridge");
const cors = require("./middlewares/cors");

const { ethers } = require("ethers");
const Transfer = require("./models/Transfer");
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

start();

async function start() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  await databaseConfig(app);
  routesConfig(app);

  app.listen(3001, () => console.log("Server running on port 3001"));
}

const contract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  bridgeAbi,
  provider
);
let currentBlock;

const main = async () => {
  await provider.on("block", (block) => {
    console.log("new block");
    currentBlock = block;
    console.log(currentBlock);
  });

  await contract.on(
    "Deposit",
    async (from, to, token, targetBridge, amount, blockNumber) => {
      console.log(blockNumber);

      if (blockNumber < currentBlock) {
        console.log("here");
        return;
      }

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

main();
