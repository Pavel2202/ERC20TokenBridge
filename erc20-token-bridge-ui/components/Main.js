import { ethers } from "ethers";
import { contractAddresses, abi } from "../constants/EthBridge";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

const Main = () => {
  const [provider, setProvider] = useState();
  const [ethBridge, setEthBridge] = useState();

  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const ethBridgeAddress =
    chainId in contractAddresses ? contractAddresses[chainId] : null;

  useEffect(() => {
    if (isWeb3Enabled) {
      const data = setup();

      Promise.all([data]).then((data) => {
        console.log(data[0]);

        const providerCall = data[0].providerCall;
        const ethBridgeCall = data[0].ethBridgeCall;

        setProvider(providerCall);
        setEthBridge(ethBridgeCall);
      });
    }
  }, [isWeb3Enabled]);

  async function setup() {
    console.log("setup");

    const providerCall = await new ethers.providers.Web3Provider(
      window.ethereum
    );
    const ethBridgeCall = await new ethers.Contract(
      ethBridgeAddress,
      abi,
      providerCall.getSigner()
    );

    console.log(ethBridgeCall);

    return {
      providerCall,
      ethBridgeCall,
    };
  }

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

  const { runContractFunction: getNonce } = useWeb3Contract({
    abi: abi,
    contractAddress: ethBridgeAddress,
    functionName: "getNonce",
    params: {},
  });

  async function listenToEvent() {
    const nonce = await getNonce();
    console.log(nonce);

    await ethBridge.once("Transfer", async (from, to, amount, step) => {
      let data = {
        from: from,
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        amount: Number(amount),
        nonce: Number(nonce),
      };
      console.log(data);
      console.log("mint");
      await ethBridge.functions.mint(
        from,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        Number(amount),
        Number(nonce)
      );
    });
  }

  async function handleSuccess(tx) {
    console.log("burn");
    console.log(tx);
    await tx.wait(1);
    console.log("waited");
    await listenToEvent();
    await tx.wait(1);
  }

  return (
    <button
      onClick={async function () {
        await burn({ onSuccess: handleSuccess });
      }}
    >
      GetBalance
    </button>
  );
};

export default Main;
