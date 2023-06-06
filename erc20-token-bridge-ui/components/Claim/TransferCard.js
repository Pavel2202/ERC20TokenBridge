import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import { tokenAddresses } from "@/constants/Token";

const TransferCard = ({ transfer }) => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const bridgeAddress =
    chainId in bridgeAddresses ? bridgeAddresses[chainId] : null;

  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  async function withdrawFromBridge(e) {
    e.preventDefault();

    const bridge = new ethers.Contract(
      bridgeAddress,
      bridgeAbi,
      provider.getSigner()
    );

    let spanElement = e.target.parentElement.children[0];
    let tokenData = spanElement.children[2].textContent
      .split(" ")[1]
      .split("...");
    let amount = spanElement.children[3].textContent.split(" ")[1];

    let allTokens = [];
    for (let key in tokenAddresses) {
      allTokens.push(tokenAddresses[key]);
    }

    let token;
    allTokens.forEach((x) => {
      if (x.includes(tokenData[0]) && x.includes(tokenData[1])) {
        token = x;
      }
    });
    amount = amount + "000000000000000000";

    if (chainId == 80001) {
      const bridge = new ethers.Contract(
        bridgeAddress,
        bridgeAbi,
        provider.getSigner()
      );

      let tx = await bridge.functions.mint(
        token,
        "WTokenShark",
        "WSHARK",
        amount
      );
      await tx.wait(1);
      console.log(tx);
    } else {
      const bridge = new ethers.Contract(
        bridgeAddress,
        bridgeAbi,
        provider.getSigner()
      );

      let tx = await bridge.functions.unlock(
        token,
        amount,
        {
          value: 100000000000,
          gasLimit: 30000000,
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
