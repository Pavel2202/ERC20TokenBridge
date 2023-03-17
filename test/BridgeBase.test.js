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
    it("Burns token, emits event and increments nonce", async function () {
      maticBridge.connect(deployerSigner).mint(deployer, deployer, 1000, 0);

      await expect(
        maticBridge.connect(deployerSigner).burn(deployer, deployer, 100)
      ).to.emit(maticBridge, "Transfer");

      const balance = await usdcToken
        .connect(deployerSigner)
        .balanceOf(deployer);

      assert.equal(Number(balance), 900);

      const nonce = await maticBridge.getNonce();
      assert.equal(nonce, 1);
    });

    it("Reverts with only admin error when called not by owner", async function () {
      maticBridge.connect(deployerSigner).mint(deployer, deployer, 1000, 0);

      await expect(
        maticBridge.burn(
          "0xf739403058D49D2B5c37DB58e788D32181aD0033",
          deployer,
          100
        )
      ).to.be.revertedWith("only admin");
    });
  });

  describe("mint", function () {
    it("Mints token, emits event and changes processedNonces", async function () {
      await expect(
        maticBridge.connect(deployerSigner).mint(deployer, deployer, 1000, 0)
      ).to.emit(maticBridge, "Transfer");
      const balance = await usdcToken
        .connect(deployerSigner)
        .balanceOf(deployer);

      assert.equal(Number(balance), 1000);

      const isNonceProcessed = await maticBridge.isNonceProcessed(0);
      assert.equal(isNonceProcessed, true);
    });

    it("Reverts with only admin error when called not by owner", async function () {
      await expect(
        maticBridge.mint(
          "0xf739403058D49D2B5c37DB58e788D32181aD0033",
          deployer,
          100,
          0
        )
      ).to.be.revertedWith("only admin");
    });

    it("Reverts if nonce is processed", async function () {
      await maticBridge.mint(deployer, deployer, 100, 0);

      await expect(
        maticBridge.mint(deployer, deployer, 100, 0)
      ).to.be.revertedWith("Transfer already processed.");
    });
  });

  describe("TokenBaseTests", function () {
    it("Updates admin address", async function () {
      await usdcToken.updateAdmin("0xf739403058D49D2B5c37DB58e788D32181aD0033");
      const newAdmin = await usdcToken.getAdminAddress();
      assert.equal("0xf739403058D49D2B5c37DB58e788D32181aD0033", newAdmin);
    });

    it("Reverts if not called by admin", async function () {
      await usdcToken.updateAdmin("0xf739403058D49D2B5c37DB58e788D32181aD0033");
      await expect(
        usdcToken.connect(deployerSigner).updateAdmin(deployer)
      ).to.be.revertedWith("only admin");
    });

    it("Reverts if tried to set admin more than once", async function () {
      await expect(
        usdcToken
          .connect(deployerSigner)
          .setAdmin("0xf739403058D49D2B5c37DB58e788D32181aD0033")
      ).to.be.revertedWith("admin set");
    });

    it("Returns is admin is set", async function () {
      let isSet = await usdcToken.isAdminSet();
      assert.equal(isSet, 1);
    })
  });
});
