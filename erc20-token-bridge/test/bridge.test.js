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
    attackerToken,
    ethBridge,
    polygonBridge;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    [deployerSigner] = await ethers.getSigners();
    alice = (await getNamedAccounts()).alice;
    aliceSigner = await ethers.getSigner(alice);
    bob = (await getNamedAccounts()).bob;
    bobSigner = await ethers.getSigner(bob);

    provider = await ethers.provider;
    await deployments.fixture(["all"]);

    ethBridge = await ethers.getContract("EthBridge", deployer);
    polygonBridge = await ethers.getContract("PolygonBridge", deployer);
    token = await ethers.getContract("Token", deployer);
    attackerToken = await ethers.getContract("AttackerToken", deployer);
    await token.connect(deployerSigner).mint(alice, 100000);
  });

  describe("constructor", function () {
    it("sets admin to deployer", async function () {
      const owner = await ethBridge.owner();
      assert.equal(deployer, owner);
    });
  });

  describe("lock", function () {
    it("reverts when reenter", async function () {
      const signature = await onPermit(
        alice,
        ethBridge.address,
        attackerToken,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .lock(bob, attackerToken.address, 100000, signatureData, {
            value: ethers.utils.parseEther("0.0000001"),
          })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if msg.value is lower than the fee", async function () {
      const signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .lock(bob, token.address, 100000, signatureData, {
            value: ethers.utils.parseEther("0.00000001"),
          })
      ).to.be.revertedWithCustomError(ethBridge, "InsufficientFee");
    });

    it("reverts if amount is 0", async function () {
      const signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .lock(bob, token.address, 0, signatureData, {
            value: ethers.utils.parseEther("0.0000001"),
          })
      ).to.be.revertedWithCustomError(ethBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      const signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .lock(bob, token.address, 100000, signatureData, {
            value: ethers.utils.parseEther("0.0000001"),
          })
      )
        .to.emit(ethBridge, "Locked")
        .withArgs(alice, bob, token.address, 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(aliceBalance.toString(), "0");

      const bridgeBalance = await token.balanceOf(ethBridge.address);
      assert.equal(bridgeBalance.toString(), "100000");
    });
  });

  describe("burn", function () {
    it("reverts when reenter", async function () {
      await attackerToken
        .connect(deployerSigner)
        .transferOwnership(polygonBridge.address);

      const signature = await onPermit(
        bob,
        polygonBridge.address,
        attackerToken,
        provider,
        100000
      );

      const signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge
          .connect(bobSigner)
          .burn(alice, attackerToken.address, 100000, signatureData)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if amount is 0", async function () {
      const signature = await onPermit(
        bob,
        polygonBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge
          .connect(bobSigner)
          .burn(alice, token.address, 0, signatureData)
      ).to.be.revertedWithCustomError(polygonBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      let signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await ethBridge
        .connect(aliceSigner)
        .lock(bob, token.address, 100000, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        });

      await polygonBridge
        .connect(bobSigner)
        .mint(token.address, "TokenShark", "SHARK", 100000);

      const wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      signature = await onPermit(
        bob,
        polygonBridge.address,
        wrappedToken,
        provider,
        100000
      );

      signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge
          .connect(bobSigner)
          .burn(alice, token.address, 100000, signatureData)
      )
        .to.emit(polygonBridge, "Burned")
        .withArgs(bob, alice, wrappedTokenAddress, token.address, 100000);

      const bobTokenBalance = await wrappedToken.balanceOf(bob);
      assert.equal(bobTokenBalance.toString(), "0");

      const tokenSupply = await wrappedToken.totalSupply();
      assert.equal(tokenSupply.toString(), "0");
    });
  });

  describe("unlock", function () {
    it("reverts when reenter", async function () {
      await expect(
        ethBridge.connect(aliceSigner).unlock(attackerToken.address, 100000, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if msg.value is lower than the fee", async function () {
      await expect(
        ethBridge.connect(aliceSigner).unlock(token.address, 100000, {
          value: ethers.utils.parseEther("0.00000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InsufficientFee");
    });

    it("reverts if amount is 0", async function () {
      await expect(
        ethBridge.connect(aliceSigner).unlock(token.address, 0, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      let signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await ethBridge
        .connect(aliceSigner)
        .lock(bob, token.address, 100000, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        });

      await polygonBridge
        .connect(bobSigner)
        .mint(token.address, "TokenShark", "SHARK", 100000);

      const wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      signature = await onPermit(
        bob,
        polygonBridge.address,
        wrappedToken,
        provider,
        100000
      );

      signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await polygonBridge
        .connect(bobSigner)
        .burn(alice, token.address, 100000, signatureData);

      await expect(
        ethBridge.connect(aliceSigner).unlock(token.address, 100000, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      )
        .to.emit(ethBridge, "Unlocked")
        .withArgs(alice, token.address, 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(aliceBalance.toString(), "100000");

      const bridgeBalance = await token.balanceOf(ethBridge.address);
      assert.equal(bridgeBalance.toString(), "0");
    });
  });

  describe("mint", function () {
    it("reverts when reenter", async function () {
      await polygonBridge
        .connect(bobSigner)
        .mint(attackerToken.address, "TokenShark", "SHARK", 100000);

      await expect(
        polygonBridge
          .connect(bobSigner)
          .mint(attackerToken.address, "TokenShark", "SHARK", 100000)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if amount is 0", async function () {
      await expect(
        polygonBridge
          .connect(bobSigner)
          .mint(token.address, "TokenShark", "SHARK", 0)
      ).to.be.revertedWithCustomError(ethBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      let signature = await onPermit(
        alice,
        ethBridge.address,
        token,
        provider,
        100000
      );

      let signatureData = {
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await ethBridge
        .connect(aliceSigner)
        .lock(bob, token.address, 100000, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        });

      await expect(
        polygonBridge
          .connect(bobSigner)
          .mint(token.address, "TokenShark", "SHARK", 100000)
      ).to.emit(polygonBridge, "Minted");

      const wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      const bobBalance = await wrappedToken.balanceOf(bob);
      assert.equal(bobBalance.toString(), "100000");

      const tokenSupply = await wrappedToken.totalSupply();
      assert.equal(tokenSupply.toString(), "100000");
    });
  });

  describe("updateOwner", function () {
    it("reverts if caller is not owner", async function () {
      await expect(ethBridge.connect(aliceSigner).updateOwner(alice)).to.be
        .reverted;
    });

    it("updates the owner", async function () {
      await ethBridge.connect(deployerSigner).updateOwner(alice);
      const owner = await ethBridge.owner();
      assert.equal(alice, owner);
    });
  });

  describe("updateFee", function () {
    it("reverts if caller is not owner", async function () {
      await expect(ethBridge.connect(aliceSigner).updateFee(5)).to.be.reverted;
    });

    it("updates the fee", async function () {
      await expect (ethBridge.connect(deployerSigner).updateFee(5)).to.emit(ethBridge, "FeeUpdated").withArgs(100000000000, 5);
      const fee = await ethBridge.fee();
      assert.equal(fee, 5);
    });
  });
});
