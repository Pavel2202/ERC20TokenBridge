const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

describe("BridgeBase", function () {
  let maticBridge, usdcToken, deployer, deployerSigner;
  const chainId = network.config.chainId;

  this.beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    deployerSigner = await ethers.getSigner(deployer);
    await deployments.fixture(["all"]);
    maticBridge = await ethers.getContract("BridgeMatic", deployer);
    usdcToken = await ethers.getContract("TokenUSDC", deployer);
  });

  describe("constructor", function () {
    it("Deployer is admin", async function () {
      const sender = await maticBridge.getAdminAddress();
      assert.equal(sender, deployer);
    });
  });

  describe("burn", function () {
    it("Burns token and emits event", async function () {
      maticBridge.connect(deployerSigner).mint(deployer, 100, 0);
      await expect(
        maticBridge.connect(deployerSigner).burn(deployer, 100)
      ).to.emit(maticBridge, "Transfer");
    });
  });

  describe("mint", function () {
    it("Mints token and emits event", async function () {
      await expect(
        maticBridge.connect(deployerSigner).mint(deployer, 100, 0)
      ).to.emit(maticBridge, "Transfer");
    });
  });
});
