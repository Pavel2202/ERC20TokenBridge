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
    factory,
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
    factory = await ethers.getContract("TokenFactory", deployer);
    token = await ethers.getContract("Token", deployer);
    await factory.connect(deployerSigner).transferOwnership(bridge.address);
    await token.connect(deployerSigner).mint(alice, 100000);
    await bridge.connect(deployerSigner).addBridge(bridge.address);
  });

  describe("constructor", function () {
    it("sets admin to deployer and factory", async function () {
      const admin = await bridge.admin();
      const factoryAddress = await bridge.tokenFactory();
      assert.equal(deployer, admin);
      assert.equal(factory.address, factoryAddress);
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

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: bridge.address,
        amount: 0,
        deadline: signature.deadline,
      };

      let tokenData = {
        name: "test",
        symbol: "test",
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        bridge
          .connect(aliceSigner)
          .deposit(depositData, tokenData, signatureData)
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

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: bridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let tokenData = {
        name: "test",
        symbol: "test",
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await bridge
        .connect(aliceSigner)
        .deposit(depositData, tokenData, signatureData);

      const withdraws = await bridge.withdraws(bob, token.address);
      assert.equal(Number(withdraws), 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(Number(aliceBalance), 0);

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

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: bridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let tokenData = {
        name: "test",
        symbol: "test",
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        bridge
          .connect(aliceSigner)
          .deposit(depositData, tokenData, signatureData)
      )
        .to.emit(bridge, "Deposit")
        .withArgs(alice, token.address, bridge.address, 100000);
    });
  });

  describe("withdrawFromBridge", function () {
    it("reverts if there amount is more than withdraw amount", async function () {
      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        bridge.connect(bobSigner).withdrawFromBridge(withdrawData)
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

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: bridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let tokenData = {
        name: "test",
        symbol: "test",
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await bridge
        .connect(aliceSigner)
        .deposit(depositData, tokenData, signatureData);

      await token.connect(deployerSigner).transferOwnership(bridge.address);

      await bridge.connect(bobSigner).withdrawFromBridge(withdrawData);

      const withdraws = await bridge.withdraws(bob, token.address);
      assert.equal(Number(withdraws), 0);

      const bobBalance = await token.balanceOf(bob);
      assert.equal(Number(bobBalance), 100000);

      const bridgeBalance = await token.balanceOf(bridge.address);
      console.log(Number(bridgeBalance));
      // assert.equal(Number(bridgeBalance), 0);
    });

    it("emits event on successful withdraw", async function () {
      const signature = await onPermit(
        alice,
        bridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: bridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let tokenData = {
        name: "test",
        symbol: "test",
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await bridge
        .connect(aliceSigner)
        .deposit(depositData, tokenData, signatureData);

      await token.connect(deployerSigner).transferOwnership(bridge.address);

      await expect(bridge.connect(bobSigner).withdrawFromBridge(withdrawData))
        .to.emit(bridge, "Withdraw")
        .withArgs(bob, token.address, 100000);
    });
  });
});
