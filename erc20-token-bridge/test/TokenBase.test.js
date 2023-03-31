const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

describe("TokenBase", function () {
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
    await ethBridge.setToken(usdcToken.address);
  });

  describe("constructor", function () {
    it("Sets bridge as admin", async function () {
      let admin = await usdcToken.getAdminAddress();
      assert.equal(deployer, admin);

      await usdcToken.connect(deployerSigner).updateAdmin(ethBridge.address);

      admin = await usdcToken.getAdminAddress();
      assert.equal(ethBridge.address, admin);
    });
  });

  describe("updateAdmin", function () {
    it("Reverts when caller is not admin", async function () {
      await expect(
        usdcToken.connect(receiverSigner).updateAdmin(receiver)
      ).to.be.revertedWith("only admin");
    });
  });

  describe("mint", function () {
    it("Reverts when caller is not admin", async function () {
      await expect(
        usdcToken.connect(receiverSigner).mint(receiver, 500)
      ).to.be.revertedWith("only admin");
    });
  });

  describe("burn", function () {
    it("Reverts when caller is not admin", async function () {
      await expect(
        usdcToken.connect(receiverSigner).burn(receiver, 500)
      ).to.be.revertedWith("only admin");
    });
  });
});
