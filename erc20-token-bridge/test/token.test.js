const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, waffle } = require("hardhat");

describe("Token", function () {
  let deployer, deployerSigner, alice, aliceSigner, token;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    [deployerSigner] = await ethers.getSigners();
    alice = (await getNamedAccounts()).alice;
    aliceSigner = await ethers.getSigner(alice);
    await deployments.fixture(["all"]);
    token = await ethers.getContract("Token", deployer);
  });

  describe("constructor", function () {
    it("sets owner", async function () {
      const owner = await token.owner();
      assert.equal(owner, deployer);
    });
  });

  describe("mint", function () {
    it("reverts if not called by owner", async function () {
      await expect(token.connect(aliceSigner).mint(alice)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("successfully mints tokens", async function () {
      await token.connect(deployerSigner).mint(alice);
      const balance = await token.balanceOf(alice);
      assert.equal(balance.toString(), "1000000000000000000");
    });
  });
});
