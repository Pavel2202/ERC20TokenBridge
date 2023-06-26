import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useMoralis } from "react-moralis";
import { useNotification } from "web3uikit";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";

const TransferCard = ({ transfer }) => {
  const baseUrl = "http://localhost:3001";

  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const bridgeAddress =
    chainId in bridgeAddresses ? bridgeAddresses[chainId] : null;

  const dispatch = useNotification();

  const [provider, setProvider] = useState({});
  const [tokens, setTokens] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
      startMoralis();
      getTokens();
    }
  }, [chainId]);

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
    try {
      e.preventDefault();

      if (bridgeAddress == null) {
        throw new Error("Invalid chain");
      }

      e.currentTarget.disabled = true;
      e.currentTarget.textContent = "Claimed";

      const bridge = new ethers.Contract(
        bridgeAddress,
        bridgeAbi,
        provider.getSigner()
      );

      let tokenAddress = transfer.token;
      let token;
      let receivedToken;
      let tx;

      for (let key in tokens) {
        if (
          tokens[key].token_address.toLowerCase() == tokenAddress.toLowerCase()
        ) {
          token = tokens[key];
        }
      }

      if (chainId == 11155111) {
        tx = await bridge.functions.unlock(
          transfer.token,
          transfer.amount.toString(),
          {
            value: ethers.utils.parseEther("0.0000001"),
          }
        );
        receivedToken = transfer.token;
      } else if (chainId == 80001) {
        tx = await bridge.functions.mint(
          token.token_address,
          "W" + token.name,
          "W" + token.symbol,
          // "0xEF432827A7F0B0bE03c36B1104E5A3e1081D3D21",
          // "WTokenShark",
          // "WSHARK",
          transfer.amount.toString()
        );

        //"0xEF432827A7F0B0bE03c36B1104E5A3e1081D3D21"
        let wtoken = await bridge.functions.tokenToWrappedToken(
          token.token_address
        );
        receivedToken = wtoken;
      } else {
        throw new Error("Invalid chain");
      }

      await tx.wait();
      await fetch(`${baseUrl}/transfers/${transfer._id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ ...transfer }),
      });

      handleSuccess(receivedToken);
    } catch (err) {
      console.log(e);
      handleError(err.message);
      e.target.disabled = false;
      e.target.textContent = "Claim";
    }
  }

  function handleSuccess(receivedToken) {
    dispatch({
      type: "success",
      message: "Claimed " + receivedToken,
      title: "Tx Notification",
      position: "topR",
    });

    alert("Copied the text: " + receivedToken);

    addEventListener("click", copyToClipboard(receivedToken));
    removeEventListener("click", copyToClipboard(receivedToken));
  }

  function copyToClipboard(receivedToken) {
    navigator.clipboard.writeText(receivedToken);
  }

  function handleError(message) {
    dispatch({
      type: "error",
      message: message,
      title: "Error Notification",
      position: "topR",
    });
  }

  return (
    <div className="mb-3 flex items-stretch justify-center">
      <span className="mr-5 border-solid border-4 rounded-md border-black">
        <span className="mr-6">
          From: {transfer.from.slice(0, 6)}...
          {transfer.from.slice(transfer.from.length - 4)} ({transfer.fromBridge}
          )
        </span>
        <span className="mr-6">
          To: {transfer.to.slice(0, 6)}...
          {transfer.from.slice(transfer.to.length - 4)} ({transfer.toBridge})
        </span>
        <span className="mr-6">
          Token: {transfer.token.slice(0, 6)}...
          {transfer.token.slice(transfer.token.length - 4)}
        </span>
        <span className="mr-6">
          Amount:
          {ethers.utils.formatUnits(transfer.amount.toString(), "ether")}
        </span>
      </span>
      <button
        className="shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded w-16"
        onClick={withdrawFromBridge}
      >
        Claim
      </button>
    </div>
  );
};

export default TransferCard;
