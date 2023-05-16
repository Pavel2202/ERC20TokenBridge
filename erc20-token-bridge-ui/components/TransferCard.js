import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";

const TransferCard = ({ transfer }) => {
  // const from =
  //   transfer.from.slice(0, 6) +
  //   "..." +
  //   transfer.from.slice(transfer.from.length - 4);
  // const to =
  //   transfer.to.slice(0, 6) + "..." + transfer.to.slice(transfer.to.length - 4);
  // const amount = transfer.amount / 10 ** 18;

  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  async function withdrawFromBridgeCall(e) {
    e.preventDefault();

    let divElement = e.target.parentElement;
    let from = divElement.children[0].textContent;
    let to = divElement.children[1].textContent;
    let token = divElement.children[2].textContent;
    let amount = divElement.children[3].textContent;

    const bridge = new ethers.Contract(
      bridgeAddresses[31337][0],
      bridgeAbi,
      provider.getSigner()
    );

    let withdrawData = {
      token: token,
      amount: amount,
    };

    console.log(await bridge.functions.tokenToWrappedToken(token));

    let tx = await bridge.functions.withdraw(withdrawData, {
      gasLimit: 30000000,
    });
  }

  return (
    <>
      <div>
        <div>
          <span>{transfer.from}</span> <span>{transfer.to}</span>{" "}
          <span>{transfer.token}</span> <span>{transfer.amount}</span>
          <button onClick={withdrawFromBridgeCall}>Claim</button>
        </div>
      </div>
      
    </>
  );
};

export default TransferCard;
