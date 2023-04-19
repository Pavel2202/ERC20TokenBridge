const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

xdescribe("Factory", function () {
  let deployer, deployerSigner, alice, aliceSigner, factory, token;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    [deployerSigner] = await ethers.getSigners();
    alice = (await getNamedAccounts()).alice;
    aliceSigner = await ethers.getSigner(alice);
    await deployments.fixture(["all"]);
    factory = await ethers.getContract("TokenFactory", deployer);
  });

  describe("create", function () {
    it("reverts if not called by owner", async function () {
      await expect(
        factory.connect(aliceSigner).create("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "test", "TEST")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("successfully creates wrapped token", async function () {
      await expect(factory.create("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", "test", "TEST")).to.emit(factory, "TokenCreated");
      const wrappedTokenAddress = await factory.tokens("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
      expect(wrappedTokenAddress).to.be.properAddress
    });
  });
});
