import { ethers } from "ethers";
import { contractAddresses, abi } from "../constants/EthBridge";
import { useMoralis, useWeb3Contract } from "react-moralis";

const Main = () => {
  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const ethBridgeAddress =
    chainId in contractAddresses ? contractAddresses[chainId] : null;

  const addTokenValue = 5000000000;

  const { runContractFunction: balance } = useWeb3Contract({
    abi: abi,
    contractAddress: ethBridgeAddress,
    functionName: "getBalance",
    params: {},
  });

  const { runContractFunction: burn } = useWeb3Contract({
    abi: abi,
    contractAddress: ethBridgeAddress,
    functionName: "burn",
    params: {
      from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      amount: addTokenValue,
    },
  });

  const { runContractFunction: mint } = useWeb3Contract({
    abi: abi,
    contractAddress: ethBridgeAddress,
    functionName: "mint",
    params: {
      from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amount: addTokenValue,
      otherChainNonce: 0,
    },
  });

  async function getBalance() {
    console.log("test");
    await burn();
    await mint();
  }

  return <button onClick={getBalance}>GetBalance</button>;
};

export default Main;
