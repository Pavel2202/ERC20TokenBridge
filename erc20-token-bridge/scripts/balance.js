const { ethers, getNamedAccounts } = require("hardhat");
const abi = require("../artifacts/contracts/TokenUSDC.sol/TokenUSDC.json").abi;

async function done() {
  const deployer = (await getNamedAccounts()).deployer;
  const tokenUsdc = await ethers.getContractFactory("TokenUSDC");
  const deployToken = await tokenUsdc.deploy();

  await deployToken.setAdmin(deployer);

  let balance = await deployToken.balanceOf(deployer);
  console.log(Number(balance));

  await deployToken.mint(deployer, deployer, 1000);
  console.log("minted");

  balance = await deployToken.balanceOf(deployer);
  console.log(Number(balance));

  await deployToken.burn(deployer, deployer, 100);
  console.log("burnt");

  balance = await deployToken.balanceOf(deployer);
  console.log(Number(balance));
}

done();
