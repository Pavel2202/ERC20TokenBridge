const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, waffle } = require("hardhat");
const { onPermit } = require("../scripts/permit");

describe("Bridge", function () {
  let provider,
    deployer,
    deployerSigner,
    alice,
    aliceSigner,
    bob,
    bobSigner,
    token,
    ethereumBridge,
    polygonBridge;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    [deployerSigner] = await ethers.getSigners();
    alice = (await getNamedAccounts()).alice;
    aliceSigner = await ethers.getSigner(alice);
    bob = (await getNamedAccounts()).bob;
    bobSigner = await ethers.getSigner(bob);

    provider = waffle.provider;
    await deployments.fixture(["all"]);

    ethereumBridge = await ethers.getContract("EthereumBridge", deployer);
    polygonBridge = await ethers.getContract("PolygonBridge", deployer);
    ethereumBridge.connect(deployerSigner).addBridge(polygonBridge.address);
    polygonBridge.connect(deployerSigner).addBridge(ethereumBridge.address);

    token = await ethers.getContract("Token", deployer);
    await token.connect(deployerSigner).mint(alice);
    await token.connect(deployerSigner).mint(polygonBridge.address);
  });

  describe("constructor", function () {
    it("sets admin to deployer", async function () {
      const admin = await ethereumBridge.admin();
      assert.equal(deployer, admin);
    });
  });

  describe("sendToBridge", function () {
    it("reverts if target bridge is not registered bridge", async function () {
      const signature = await onPermit(
        alice,
        ethereumBridge.address,
        token,
        provider,
        100
      );

      await expect(
        ethereumBridge
          .connect(aliceSigner)
          .sendToBridge(
            bob,
            token.address,
            bob,
            100,
            signature.deadline,
            signature.v,
            signature.r,
            signature.s
          )
      ).to.be.revertedWith("invalid bridge address");
    });

    it("reverts if amount is 0", async function () {
      const signature = await onPermit(
        alice,
        ethereumBridge.address,
        token,
        provider,
        0
      );

      await expect(
        ethereumBridge
          .connect(aliceSigner)
          .sendToBridge(
            bob,
            token.address,
            polygonBridge.address,
            0,
            signature.deadline,
            signature.v,
            signature.r,
            signature.s
          )
      ).to.be.revertedWith("invalid amount");
    });

    it("increases sender's deposit and token balance of the bridge", async function () {
      const signature = await onPermit(
        alice,
        ethereumBridge.address,
        token,
        provider,
        100
      );

      await ethereumBridge
        .connect(aliceSigner)
        .sendToBridge(
          bob,
          token.address,
          polygonBridge.address,
          100,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        );

      const deposits = await ethereumBridge.deposits(alice, token.address);
      assert.equal(Number(deposits), 100);

      const withdraws = await polygonBridge.withdraws(bob, token.address);
      assert.equal(Number(withdraws), 100);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(Number(aliceBalance), 900);

      const bridgeBalance = await token.balanceOf(ethereumBridge.address);
      assert.equal(Number(bridgeBalance), 100);
    });

    it("emits event on successful deposit", async function () {
      const signature = await onPermit(
        alice,
        ethereumBridge.address,
        token,
        provider,
        100
      );

      await expect(
        ethereumBridge
          .connect(aliceSigner)
          .sendToBridge(
            bob,
            token.address,
            polygonBridge.address,
            100,
            signature.deadline,
            signature.v,
            signature.r,
            signature.s
          )
      )
        .to.emit(ethereumBridge, "Deposit")
        .withArgs(alice, token.address, polygonBridge.address, 100);
    });
  });

  describe("increaseWithdraw", function () {
    it("reverts if not called by registered bridge", async function () {
      await expect(
        ethereumBridge
          .connect(aliceSigner)
          .increaseWithdraw(bob, token.address, 100)
      ).to.be.revertedWith("no permission");
    });
  });

  describe("withdrawFromBridge", function () {
    it("reverts if from bridge is not registered bridge", async function () {
      await expect(
        polygonBridge.withdrawFromBridge(alice, token.address, bob, 100)
      ).to.be.revertedWith("invalid bridge address");
    });

    it("reverts if there amount is more than withdraw amount", async function () {
      await expect(
        polygonBridge
          .connect(bobSigner)
          .withdrawFromBridge(alice, token.address, ethereumBridge.address, 100)
      ).to.be.revertedWith("insufficient balance");
    });

    it("decreases receiver's withraw and token balance of the bridge", async function () {
      const signature = await onPermit(
        alice,
        ethereumBridge.address,
        token,
        provider,
        100
      );

      await ethereumBridge
        .connect(aliceSigner)
        .sendToBridge(
          bob,
          token.address,
          polygonBridge.address,
          100,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        );

      await polygonBridge
        .connect(bobSigner)
        .withdrawFromBridge(alice, token.address, ethereumBridge.address, 100);

      const withdraws = await polygonBridge.withdraws(bob, token.address);
      assert.equal(Number(withdraws), 0);

      const deposits = await ethereumBridge.deposits(alice, token.address);
      assert.equal(Number(deposits), 0);

      const bobBalance = await token.balanceOf(bob);
      assert.equal(Number(bobBalance), 100);

      const bridgeBalance = await token.balanceOf(polygonBridge.address);
      assert.equal(Number(bridgeBalance), 900);
    });

    it("emits event on successful withdraw", async function () {
      const signature = await onPermit(
        alice,
        ethereumBridge.address,
        token,
        provider,
        100
      );

      await ethereumBridge
        .connect(aliceSigner)
        .sendToBridge(
          bob,
          token.address,
          polygonBridge.address,
          100,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        );

      await expect(
        polygonBridge
          .connect(bobSigner)
          .withdrawFromBridge(alice, token.address, ethereumBridge.address, 100)
      )
        .to.emit(polygonBridge, "Withdraw")
        .withArgs(bob, token.address, 100);
    });
  });

  describe("decreaseDeposits", function () {
    it("reverts if not called by registered bridge", async function () {
      await expect(
        polygonBridge
          .connect(bobSigner)
          .decreaseDeposits(alice, token.address, 100)
      ).to.be.revertedWith("no permission");
    });
  });

  describe("addBridge", function () {
    it("reverts if not called by admin", async function () {
      await expect(
        ethereumBridge.connect(aliceSigner).addBridge(bob)
      ).to.be.revertedWith("only admin");
    });

    it("adds new bridge", async function () {
      await ethereumBridge.connect(deployerSigner).addBridge(bob);
      const isBobBridge = await ethereumBridge
        .connect(deployerSigner)
        .bridges(bob);
      assert.equal(isBobBridge, true);
    });
  });
});
