const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

describe("BridgeBase", function () {
  let ethBridge, limeToken, deployer, deployerSigner, receiver, receiverSigner;
  const chainId = network.config.chainId;

  this.beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    deployerSigner = await ethers.getSigner(deployer);
    receiver = (await getNamedAccounts()).receiver;
    receiverSigner = await ethers.getSigner(receiver);
    await deployments.fixture(["all"]);
    ethBridge = await ethers.getContract("BridgeEth", deployer);
    limeToken = await ethers.getContract("LimeToken", deployer);
    ethBridge.setToken(limeToken.address);
  });

  describe("constructor", function () {
    it("Sets deployer as admin", async function () {
      const sender = await ethBridge.getAdminAddress();
      const balance = (await limeToken.balanceOf(deployer)).toString();
      assert.equal(sender, deployer);
      assert.equal(balance, "2000000000000000000")
    });
  });
});
