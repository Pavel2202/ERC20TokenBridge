import { ethers, BigNumber } from "ethers";
import { useState, useEffect } from "react";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useMoralis } from "react-moralis";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";

const TransferCard = ({ transfer }) => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const bridgeAddress =
    chainId in bridgeAddresses ? bridgeAddresses[chainId] : null;

  const [provider, setProvider] = useState({});
  const [tokens, setTokens] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
      startMoralis();
      getTokens();
    }
  }, []);

  async function startMoralis() {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }
  }

  async function getTokens() {
    const address = ethereum.selectedAddress;
    const chain = EvmChain.SEPOLIA;
    const userTokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain,
    });
    setTokens(userTokens.toJSON());
  }

  async function withdrawFromBridge(e) {
    e.preventDefault();

    const bridge = new ethers.Contract(
      bridgeAddress,
      bridgeAbi,
      provider.getSigner()
    );

    let tokenAddress = transfer.token;
    let token;

    for (let key in tokens) {
      if (
        tokens[key].token_address.toLowerCase() == tokenAddress.toLowerCase()
      ) {
        token = tokens[key];
      }
    }

    if (chainId == 80001) {
      let wtoken = await bridge.functions.tokenToWrappedToken(
        token.token_address
      );
      console.log(wtoken);
      
      let tx = await bridge.functions.mint(
        token.token_address,
        "W" + token.name,
        "W" + token.symbol,
        transfer.amount.toString()
      );
      await tx.wait(1);
      console.log(tx);
    } else {
      const feeData = await provider.getFeeData();
      let tx = await bridge.functions.unlock(
        transfer.token,
        transfer.amount.toString(),
        {
          value: ethers.utils.parseEther("0.0000001"),
          maxFeePerGas: BigNumber.from(feeData.maxFeePerGas),
          maxPriorityFeePerGas: BigNumber.from(feeData.maxPriorityFeePerGas),
        }
      );
      await tx.wait(1);
      console.log(tx);
    }

    let response = await fetch(
      `http://localhost:3001/transfers/${transfer._id}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ ...transfer }),
      }
    );

    console.log(response);
    let result = await response.json();
    console.log(result);
  }

  return (
    <div>
      <span className="w-96 border-solid border-4 rounded-md border-black">
        <span className="mr-6">
          From: {transfer.from.slice(0, 6)}...
          {transfer.from.slice(transfer.from.length - 4)}
        </span>{" "}
        <span className="mr-6">
          To: {transfer.to.slice(0, 6)}...
          {transfer.from.slice(transfer.to.length - 4)}
        </span>
        <span className="mr-6">
          Token: {transfer.token.slice(0, 6)}...
          {transfer.token.slice(transfer.token.length - 4)}
        </span>{" "}
        <span className="mr-6">Amount: {transfer.amount / 10 ** 18}</span>
      </span>
      <button
        className="shadow bg-lime-500 hover:bg-lime-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        onClick={withdrawFromBridge}
      >
        Claim
      </button>
    </div>
  );
};

export default TransferCard;
