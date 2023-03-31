const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

describe("BridgeBase", function () {
  let ethBridge, usdcToken, deployer, deployerSigner, receiver, receiverSigner;
  const chainId = network.config.chainId;

  this.beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    deployerSigner = await ethers.getSigner(deployer);
    receiver = (await getNamedAccounts()).receiver;
    receiverSigner = await ethers.getSigner(receiver);
    await deployments.fixture(["all"]);
    ethBridge = await ethers.getContract("BridgeEth", deployer);
    usdcToken = await ethers.getContract("TokenUSDC", deployer);
    await usdcToken.connect(deployerSigner).updateAdmin(ethBridge.address);
    await ethBridge.setToken(usdcToken.address);
  });

  describe("constructor", function () {
    it("Sets deployer as admin", async function () {
      const sender = await ethBridge.getAdminAddress();
      assert.equal(sender, deployer);
    });
  });

  describe("burn", function () {
    it("Successfully burns", async function () {
      await ethBridge
        .connect(deployerSigner)
        .mint(receiver, 500, 0, ethBridge.address);

      await expect(ethBridge.connect(receiverSigner).burn(1)).to.emit(
        ethBridge,
        "Transfer"
      );

      const balance = await usdcToken.balanceOf(receiver);
      assert.equal(balance, 499);

      const nonce = Number(await ethBridge.getNonce());
      assert.equal(nonce, 1);
    });
  });

  describe("mint", function () {
    it("Reverts if nonce is processed", async function () {
      await ethBridge
        .connect(deployerSigner)
        .mint(receiver, 500, 0, ethBridge.address);

      await expect(
        ethBridge
          .connect(deployerSigner)
          .mint(receiver, 500, 0, ethBridge.address)
      ).to.be.revertedWith("Transfer already processed.");
    });

    it("Successfully mints", async function () {
      await expect(
        ethBridge
          .connect(deployerSigner)
          .mint(receiver, 500, 0, ethBridge.address)
      ).to.emit(ethBridge, "Transfer");

      const balance = await usdcToken.balanceOf(receiver);
      assert.equal(balance, 500);
    });
  });

  describe("isNonceProcessed", function () {
    it("Retuns true if nonce is processed", async function () {
      await ethBridge
        .connect(deployerSigner)
        .mint(receiver, 500, 0, ethBridge.address);

      const isProcessed = await ethBridge.isNonceProcessed(
        ethBridge.address,
        0
      );
      assert.equal(isProcessed, true);
    });

    it("Retuns false if nonce is not processed", async function () {
      const isProcessed = await ethBridge.isNonceProcessed(
        ethBridge.address,
        0
      );
      assert.equal(isProcessed, false);
    });
  });
});
