const { ethers, getNamedAccounts } = require("hardhat");

async function done() {
    const deployer = (await getNamedAccounts()).deployer;
    const receiver = (await getNamedAccounts()).receiver;
    const contractToken = await ethers.getContractFactory("TokenUSDC");
    const tokenUsdc = await contractToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
    await tokenUsdc.setAdmin(deployer);

    const contractBridge = await ethers.getContractFactory("BridgeEth");
    const ethBridge = await contractBridge.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
  
    let balance = await tokenUsdc.balanceOf(receiver);
    console.log(Number(balance));
  
    await ethBridge.mint(deployer, receiver, 1000, 0);
    console.log("minted");
  
    balance = await tokenUsdc.balanceOf(receiver);
    console.log(Number(balance));
  
    await ethBridge.burn(deployer, receiver, 100);
    console.log("burnt");
  
    balance = await tokenUsdc.balanceOf(receiver);
    console.log(Number(balance));

    await ethBridge.burn(deployer, receiver, 100);
    console.log("burnt");
  
    balance = await tokenUsdc.balanceOf(receiver);
    console.log(Number(balance));
  }
  
  done();