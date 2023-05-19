import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import { tokenAddresses } from "@/constants/Token";

const TransferCard = ({ transfer }) => {
  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  async function withdrawFromBridgeCall(e) {
    e.preventDefault();
    const chainId = await (await provider.getNetwork()).chainId;

    const bridge = new ethers.Contract(
      bridgeAddresses[chainId][1],
      bridgeAbi,
      provider.getSigner()
    );

    let spanElement = e.target.parentElement.children[0];
    let tokenData = spanElement.children[2].textContent
      .split(" ")[1]
      .split("...");
    let amount = spanElement.children[3].textContent.split(" ")[1];

    let allTokens = tokenAddresses[chainId];

    let token;
    allTokens.forEach((x) => {
      if (x.includes(tokenData[0]) && x.includes(tokenData[1])) {
        token = x;
      }
    });
    amount = amount + "000000000000000000";

    let withdrawData = {
      token: token,
      amount: amount
    };

    console.log(withdrawData);

    let tx = await bridge.functions.withdraw(withdrawData, {
      gasLimit: 30000000,
    });
    await tx.wait(1);
    console.log(tx);
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
        onClick={withdrawFromBridgeCall}
      >
        Claim
      </button>
    </div>
  );
};

export default TransferCard;
