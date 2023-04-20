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
    ethBridge,
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

    ethBridge = await ethers.getContract("EthBridge", deployer);
    polygonBridge = await ethers.getContract("PolygonBridge", deployer);
    token = await ethers.getContract("Token", deployer);
    await token.connect(deployerSigner).mint(alice, 100000);
    await ethBridge.connect(deployerSigner).addBridge(polygonBridge.address);
    await polygonBridge.connect(deployerSigner).addBridge(ethBridge.address);
  });

  describe("constructor", function () {
    it("sets admin to deployer", async function () {
      const admin = await ethBridge.admin();
      assert.equal(deployer, admin);
    });
  });

  describe("deposit", function () {
    it("reverts if token is not supported", async function () {
      const signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: polygonBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge.connect(aliceSigner).deposit(depositData, signatureData)
      ).to.be.reverted;
    });

    it("reverts if amount is 0", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);
      const signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        0
      );

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: polygonBridge.address,
        amount: 0,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge.connect(aliceSigner).deposit(depositData, signatureData)
      ).to.be.reverted;
    });

    it("increases sender's deposit and token balance of the bridge with token", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);
      const signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: polygonBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge.connect(aliceSigner).deposit(depositData, signatureData)
      )
        .to.emit(ethBridge, "DepositWithTransfer")
        .withArgs(alice, token.address, polygonBridge.address, 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(Number(aliceBalance), 0);

      const bridgeBalance = await token.balanceOf(ethBridge.address);
      assert.equal(Number(bridgeBalance), 100000);

      const bobBalance = await polygonBridge.balance(bob, depositData.token);
      assert.equal(Number(bobBalance), 100000);

      const nonce = await ethBridge.tokenNonce(token.address);
      assert.equal(Number(nonce), 1);
    });

    it("increases sender's deposit and token balance of the bridge with wrapped token", async function () {
      //Alice gives Bob real tokens
      await ethBridge.connect(deployerSigner).addToken(token.address);
      await polygonBridge.connect(deployerSigner).addToken(token.address);

      let signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: polygonBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await ethBridge.connect(aliceSigner).deposit(depositData, signatureData);
      /////////

      // Bob withdraws wrapped tokens
      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WSHARK");

      await polygonBridge.connect(bobSigner).withdrawFromBridge(withdrawData);

      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      ///////////////////

      //Bob sends wrapped tokens to the bridge

      signature = await onPermit(
        bob,
        polygonBridge.address,
        wrappedToken,
        provider,
        100000
      );

      depositData = {
        to: alice,
        token: token.address,
        targetBridge: ethBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge.connect(bobSigner).deposit(depositData, signatureData)
      )
        .to.emit(polygonBridge, "DepositWithBurn")
        .withArgs(bob, token.address, ethBridge.address, 100000);

      const aliceBalance = await ethBridge.balance(alice, token.address);
      assert.equal(Number(aliceBalance), 100000);

      const bobBridgeBalance = await polygonBridge.balance(
        bob,
        depositData.token
      );
      assert.equal(Number(bobBridgeBalance), 0);

      const bobTokenBalance = await wrappedToken.balanceOf(bob);
      assert.equal(Number(bobTokenBalance), 0);

      ///////////////
    });
  });

  describe("withdrawFromBridge", function () {
    it("reverts if token is not supported", async function () {
      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        polygonBridge.connect(aliceSigner).withdrawFromBridge(withdrawData)
      ).to.be.reverted;
    });

    it("reverts if there amount is more than withdraw amount", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);
      await polygonBridge.connect(deployerSigner).addToken(token.address);

      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        polygonBridge.connect(bobSigner).withdrawFromBridge(withdrawData)
      ).to.be.reverted;
    });

    it("withdraws tokens", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);
      await polygonBridge.connect(deployerSigner).addToken(token.address);

      //Alice gives Bob real tokens
      let signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: bob,
        token: token.address,
        targetBridge: polygonBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await ethBridge.connect(aliceSigner).deposit(depositData, signatureData);
      /////////

      // Bob withdraws wrapped tokens
      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WSHARK");

      await expect(
        polygonBridge.connect(bobSigner).withdrawFromBridge(withdrawData)
      )
        .to.emit(polygonBridge, "WithdrawWithMint")
        .withArgs(bob, token.address, 100000);

      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      const bobBalance = await wrappedToken.balanceOf(bob);
      assert.equal(Number(bobBalance), 100000);
      ///////////////////

      //Bob sends wrapped tokens to the bridge

      signature = await onPermit(
        bob,
        polygonBridge.address,
        wrappedToken,
        provider,
        100000
      );

      depositData = {
        to: alice,
        token: token.address,
        targetBridge: ethBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await polygonBridge
        .connect(bobSigner)
        .deposit(depositData, signatureData);

      //Alice withdraws token from the bridge
      withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        ethBridge.connect(aliceSigner).withdrawFromBridge(withdrawData)
      )
        .to.emit(ethBridge, "WithdrawWithTransfer")
        .withArgs(alice, token.address, 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(Number(aliceBalance), 100000);

      const bridgeBalance = await token.balanceOf(ethBridge.address);
      assert.equal(Number(bridgeBalance), 0);
    });
  });

  describe("increaseBalance", function () {
    it("reverts if caller is not a bridge", async function () {
      await expect(
        ethBridge
          .connect(aliceSigner)
          .increaseBalance(alice, token.address, 50000)
      ).to.be.reverted;
    });

    it("increases balance", async function () {
      await ethBridge.connect(deployerSigner).addBridge(deployer);
      await ethBridge
        .connect(deployerSigner)
        .increaseBalance(alice, token.address, 1);
      const balance = await ethBridge.balance(alice, token.address);
      assert.equal(Number(balance), 1);
    });
  });

  describe("addBridge", function () {
    it("reverts if caller is not admin", async function () {
      await expect(
        ethBridge.connect(aliceSigner).addBridge(alice)
      ).to.be.reverted;
    });

    it("adds bridge", async function () {
      await ethBridge.connect(deployerSigner).addBridge(alice);
      const isBridge = await ethBridge.bridges(alice);
      assert.equal(isBridge, true);
    });
  });

  describe("addToken", function () {
    it("reverts if caller is not admin", async function () {
      await expect(
        ethBridge.connect(aliceSigner).addToken(alice)
      ).to.be.reverted;
    });

    it("adds token", async function () {
      await ethBridge.connect(deployerSigner).addToken(alice);
      const isToken = await ethBridge.supportedTokens(alice);
      assert.equal(isToken, true);
    });
  });

  describe("createWrappedToken", function () {
    it("reverts if caller is not admin", async function () {
      await expect(
        ethBridge.connect(aliceSigner).createWrappedToken(alice, "test", "test")
      ).to.be.reverted;
    });

    it("creates wrapped token", async function () {
      await ethBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "test", "test");
      const wrappedTokenAddress = await ethBridge.tokenToWrappedToken(
        token.address
      );
      assert.notEqual(wrappedTokenAddress, "0x");
    });
  });

  describe("updateAdmin", function () {
    it("reverts if caller is not admin", async function () {
      await expect(
        ethBridge.connect(aliceSigner).updateAdmin(alice)
      ).to.be.reverted;
    });

    it("updates the admin", async function () {
      await ethBridge.connect(deployerSigner).updateAdmin(alice);
      const admin = await ethBridge.admin();
      assert.equal(alice, admin);
    });
  });
});
