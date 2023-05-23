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
    await ethBridge.connect(deployerSigner).addBridge(polygonBridge.address);
    await polygonBridge.connect(deployerSigner).addBridge(ethBridge.address);
  });

  describe("constructor", function () {
    it("sets admin to deployer", async function () {
      const owner = await ethBridge.owner();
      assert.equal(deployer, owner);
    });
  });

  describe("lock", function () {
    it("reverts when reenter", async function () {
      await ethBridge.connect(deployerSigner).addToken(attackerToken.address);

      const signature = await onPermit(
        alice,
        ethBridge.address,
        attackerToken,
        provider,
        100000
      );

      let depositData = {
        to: bob,
        token: attackerToken.address,
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
        ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if msg.value is lower than the fee", async function () {
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
        ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
          value: ethers.utils.parseEther("0.00000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InsufficientFee");
    });

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
        ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "TokenNotSupported");
    });

    it("reverts if bridge is not supported", async function () {
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
        targetBridge: bob,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InvalidBridge");
    });

    it("reverts if amount is 0", async function () {
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
        amount: 0,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InvalidAmount");
    });

    it("emits event", async function () {
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
        ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      )
        .to.emit(ethBridge, "Locked")
        .withArgs(alice, bob, token.address, polygonBridge.address, 100000);

      const aliceBalance = await token.balanceOf(alice);
      assert.equal(aliceBalance.toString(), "0");

      const bridgeBalance = await token.balanceOf(ethBridge.address);
      assert.equal(bridgeBalance.toString(), "100000");
    });
  });

  describe("burn", function () {
    it("reverts when reenter", async function () {
      await polygonBridge
        .connect(deployerSigner)
        .addToken(attackerToken.address);
      await attackerToken
        .connect(deployerSigner)
        .transferOwnership(polygonBridge.address);

      let signature = await onPermit(
        bob,
        polygonBridge.address,
        attackerToken,
        provider,
        100000
      );

      let depositData = {
        to: alice,
        token: attackerToken.address,
        targetBridge: ethBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if msg.value is lower than the fee", async function () {
      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");

      const signature = await onPermit(
        bob,
        polygonBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: alice,
        token: token.address,
        targetBridge: ethBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
          value: ethers.utils.parseEther("0.00000001"),
        })
      ).to.be.revertedWithCustomError(polygonBridge, "InsufficientFee");
    });

    it("reverts if token is not supported", async function () {
      const signature = await onPermit(
        bob,
        polygonBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: alice,
        token: token.address,
        targetBridge: ethBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(polygonBridge, "TokenNotSupported");
    });

    it("reverts if bridge is not supported", async function () {
      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");
      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );

      const signature = await onPermit(
        bob,
        polygonBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: alice,
        token: wrappedTokenAddress,
        targetBridge: bob,
        amount: 100000,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(polygonBridge, "InvalidBridge");
    });

    it("reverts if amount is 0", async function () {
      await polygonBridge.connect(deployerSigner).addToken(token.address);

      const signature = await onPermit(
        bob,
        polygonBridge.address,
        token,
        provider,
        100000
      );

      let depositData = {
        to: alice,
        token: token.address,
        targetBridge: ethBridge.address,
        amount: 0,
        deadline: signature.deadline,
      };

      let signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await expect(
        polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(polygonBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);

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

      await ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
        value: ethers.utils.parseEther("0.0000001"),
      });

      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");
      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      let withdrawData = {
        token: wrappedTokenAddress,
        amount: 100000,
      };

      await polygonBridge
        .connect(bobSigner)
        .mint(withdrawData, { value: ethers.utils.parseEther("0.0000001") });

      signature = await onPermit(
        bob,
        polygonBridge.address,
        wrappedToken,
        provider,
        100000
      );

      depositData = {
        to: alice,
        token: wrappedTokenAddress,
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
        polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      )
        .to.emit(polygonBridge, "Burned")
        .withArgs(bob, alice, wrappedTokenAddress, ethBridge.address, 100000);

      const bobTokenBalance = await wrappedToken.balanceOf(bob);
      assert.equal(bobTokenBalance.toString(), "0");

      const tokenSupply = await wrappedToken.totalSupply();
      assert.equal(tokenSupply.toString(), "0");
    });
  });

  describe("unlock", function () {
    it("reverts when reenter", async function () {
      await ethBridge.connect(deployerSigner).addToken(attackerToken.address);

      let withdrawData = {
        token: attackerToken.address,
        amount: 100000,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .unlock(withdrawData, { value: ethers.utils.parseEther("0.0000001") })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("reverts if msg.value is lower than the fee", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);

      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        ethBridge.connect(aliceSigner).unlock(withdrawData, {
          value: ethers.utils.parseEther("0.00000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InsufficientFee");
    });

    it("reverts if token is not supported", async function () {
      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .unlock(withdrawData, { value: ethers.utils.parseEther("0.0000001") })
      ).to.be.revertedWithCustomError(ethBridge, "TokenNotSupported");
    });

    it("reverts if amount is 0", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);

      let withdrawData = {
        token: token.address,
        amount: 0,
      };

      await expect(
        ethBridge.connect(aliceSigner).unlock(withdrawData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);

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

      await ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
        value: ethers.utils.parseEther("0.0000001"),
      });

      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");
      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      let withdrawData = {
        token: wrappedTokenAddress,
        amount: 100000,
      };

      await polygonBridge
        .connect(bobSigner)
        .mint(withdrawData, { value: ethers.utils.parseEther("0.0000001") });

      signature = await onPermit(
        bob,
        polygonBridge.address,
        wrappedToken,
        provider,
        100000
      );

      depositData = {
        to: alice,
        token: wrappedTokenAddress,
        targetBridge: ethBridge.address,
        amount: 100000,
        deadline: signature.deadline,
      };

      signatureData = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
      };

      await polygonBridge.connect(bobSigner).burn(depositData, signatureData, {
        value: ethers.utils.parseEther("0.0000001"),
      });

      withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        ethBridge
          .connect(aliceSigner)
          .unlock(withdrawData, { value: ethers.utils.parseEther("0.0000001") })
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
      await polygonBridge.connect(deployerSigner).addToken(attackerToken.address);

      let withdrawData = {
        token: attackerToken.address,
        amount: 100000,
      };

      await expect(
        polygonBridge
          .connect(bobSigner)
          .mint(withdrawData, { value: ethers.utils.parseEther("0.0000001") })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    })

    it("reverts if msg.value is lower than the fee", async function () {
      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");
      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );

      let withdrawData = {
        token: wrappedTokenAddress,
        amount: 100000,
      };

      await expect(
        polygonBridge.connect(bobSigner).mint(withdrawData, {
          value: ethers.utils.parseEther("0.00000001"),
        })
      ).to.be.revertedWithCustomError(polygonBridge, "InsufficientFee");
    });

    it("reverts if token is not supported", async function () {
      let withdrawData = {
        token: token.address,
        amount: 100000,
      };

      await expect(
        polygonBridge.connect(bobSigner).mint(withdrawData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(polygonBridge, "TokenNotSupported");
    });

    it("reverts if amount is 0", async function () {
      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");
      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );

      let withdrawData = {
        token: wrappedTokenAddress,
        amount: 0,
      };

      await expect(
        polygonBridge.connect(aliceSigner).mint(withdrawData, {
          value: ethers.utils.parseEther("0.0000001"),
        })
      ).to.be.revertedWithCustomError(ethBridge, "InvalidAmount");
    });

    it("emits event", async function () {
      await ethBridge.connect(deployerSigner).addToken(token.address);

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

      await ethBridge.connect(aliceSigner).lock(depositData, signatureData, {
        value: ethers.utils.parseEther("0.0000001"),
      });

      await polygonBridge
        .connect(deployerSigner)
        .createWrappedToken(token.address, "WShark", "WShark");
      let wrappedTokenAddress = await polygonBridge.tokenToWrappedToken(
        token.address
      );
      let wrappedTokenContract = await ethers.getContractFactory("Token");
      let wrappedToken = await wrappedTokenContract.attach(wrappedTokenAddress);

      let withdrawData = {
        token: wrappedTokenAddress,
        amount: 100000,
      };

      await expect(
        polygonBridge
          .connect(bobSigner)
          .mint(withdrawData, { value: ethers.utils.parseEther("0.0000001") })
      ).to.emit(polygonBridge, "Minted");

      const bobBalance = await wrappedToken.balanceOf(bob);
      assert.equal(bobBalance.toString(), "100000");

      const tokenSupply = await wrappedToken.totalSupply();
      assert.equal(tokenSupply.toString(), "100000");
    });
  });

  describe("addBridge", function () {
    it("reverts if caller is not admin", async function () {
      await expect(ethBridge.connect(aliceSigner).addBridge(alice)).to.be
        .reverted;
    });

    it("adds bridge", async function () {
      await ethBridge.connect(deployerSigner).addBridge(alice);
      const isBridge = await ethBridge.bridges(alice);
      assert.equal(isBridge, true);
    });
  });

  describe("addToken", function () {
    it("reverts if caller is not admin", async function () {
      await expect(ethBridge.connect(aliceSigner).addToken(alice)).to.be
        .reverted;
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
      await ethBridge.connect(deployerSigner).updateFee(5);
      const fee = await ethBridge.fee();
      assert.equal(fee, 5);
    });
  });
});
