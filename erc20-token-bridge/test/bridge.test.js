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
    bridge;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    [deployerSigner] = await ethers.getSigners();
    alice = (await getNamedAccounts()).alice;
    aliceSigner = await ethers.getSigner(alice);
    bob = (await getNamedAccounts()).bob;
    bobSigner = await ethers.getSigner(bob);

    provider = waffle.provider;
    await deployments.fixture(["all"]);

    bridge = await ethers.getContract("Bridge", deployer);
    token = await ethers.getContract("Token", deployer);
    await token.mint(alice);
  });

  describe("constructor", function () {
    it("sets admin to deployer", async function () {
      const admin = await bridge.admin();
      assert.equal(deployer, admin);
    });
  });

  describe("sendToBridge", function () {
    it("reverts if amount is 0", async function () {
      const signature = await onPermit(
        alice,
        bridge.address,
        token,
        provider,
        0
      );

      await expect(
        bridge
          .connect(aliceSigner)
          .sendToBridge(
            bob,
            token.address,
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
        bridge.address,
        token,
        provider,
        100000
      );

      await bridge
        .connect(aliceSigner)
        .sendToBridge(
          bob,
          token.address,
          100000,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        );

      const deposits = await bridge.deposits(alice, token.address);
      assert.equal(Number(deposits), 100000);

      const withdraws = await bridge.withdraws(bob, token.address);
      assert.equal(Number(withdraws), 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(Number(aliceBalance), 999999999999900000);

      const bridgeBalance = await token.balanceOf(bridge.address);
      assert.equal(Number(bridgeBalance), 100000);
    });

    it("emits event on successful deposit", async function () {
      const signature = await onPermit(
        alice,
        bridge.address,
        token,
        provider,
        100000
      );

      await expect(
        bridge
          .connect(aliceSigner)
          .sendToBridge(
            bob,
            token.address,
            100000,
            signature.deadline,
            signature.v,
            signature.r,
            signature.s
          )
      )
        .to.emit(bridge, "Deposit")
        .withArgs(alice, token.address, 100000);
    });
  });

  describe("withdrawFromBridge", function () {
    it("reverts if there amount is more than withdraw amount", async function () {
      await expect(
        bridge
          .connect(bobSigner)
          .withdrawFromBridge(alice, token.address, 100)
      ).to.be.revertedWith("insufficient balance");
    });

    it("decreases receiver's withraw and token balance of the bridge", async function () {
      const signature = await onPermit(
        alice,
        bridge.address,
        token,
        provider,
        100000
      );

      await bridge
        .connect(aliceSigner)
        .sendToBridge(
          bob,
          token.address,
          100000,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        );

      await bridge
        .connect(bobSigner)
        .withdrawFromBridge(alice, token.address, 100000);

      const withdraws = await bridge.withdraws(bob, token.address);
      assert.equal(Number(withdraws), 0);

      const deposits = await bridge.deposits(alice, token.address);
      assert.equal(Number(deposits), 0);

      const bobBalance = await token.balanceOf(bob);
      assert.equal(Number(bobBalance), 100000);

      const bridgeBalance = await token.balanceOf(bridge.address);
      assert.equal(Number(bridgeBalance), 0);
    });

    it("emits event on successful withdraw", async function () {
      const signature = await onPermit(
        alice,
        bridge.address,
        token,
        provider,
        100000
      );

      await bridge
        .connect(aliceSigner)
        .sendToBridge(
          bob,
          token.address,
          100000,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        );

      await expect(
        bridge
          .connect(bobSigner)
          .withdrawFromBridge(alice, token.address, 100000)
      )
        .to.emit(bridge, "Withdraw")
        .withArgs(bob, token.address, 100000);
    });
  });
});
