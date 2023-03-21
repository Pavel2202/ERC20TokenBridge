import { ethers } from "ethers";
import { contractAddresses, abi } from "../constants/EthBridge";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

const Main = () => {
  const [provider, setProvider] = useState();
  const [params, setParams] = useState({});

  useEffect(() => {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
  }, []);

  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const ethBridgeAddress =
    chainId in contractAddresses ? contractAddresses[chainId] : null;

  const addTokenValue = 5000000000;

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
    params: params,
  });

  async function listenToEvent() {
    const ethBridge = await new ethers.Contract(
      ethBridgeAddress,
      abi,
      provider
    );

    ethBridge.once("Transfer", async (from, to, amount, date, nonce, step) => {
      setParams((params) => ({
        from: from,
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        amount: Number(amount),
        otherChainNonce: Number(nonce),
      }));
      console.log(params);
      await mint();
    });
  }

  async function burnFunction() {
    console.log("burn");
    await burn();
    listenToEvent();
  }

  return <button onClick={burnFunction}>GetBalance</button>;
};

export default Main;
