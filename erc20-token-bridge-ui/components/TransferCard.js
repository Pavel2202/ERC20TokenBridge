import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";

const TransferCard = ({ transfer }) => {
  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  async function withdrawFromBridgeCall(e) {
    e.preventDefault();

    let divElement = e.target.parentElement;
    let spanElement = divElement.children[0];

    let token = spanElement.children[2].textContent;
    let amount = spanElement.children[3].textContent;

    let bridgeAddress = bridgeAddresses[31337][0];
    console.log(bridgeAbi);
    console.log(provider);

    const bridge = new ethers.Contract(
      bridgeAddress,
      bridgeAbi,
      provider.getSigner()
    );

    let withdrawData = {
      token: token,
      amount: amount,
    };

    //console.log(await bridge.functions.tokenToWrappedToken(token));

    await bridge.functions.withdraw(withdrawData, {
      gasLimit: 30000000,
    });
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
          {transfer.from.slice(transfer.token.length - 4)}
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
