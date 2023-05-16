import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import TransferCard from "./TransferCard";

const TransferList = ({ transfers }) => {
  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  async function setup() {
    const bridge = new ethers.Contract(
      bridgeAddresses[31337][0],
      bridgeAbi,
      provider.getSigner()
      );
      console.log(bridge);
    await bridge.functions.createWrappedToken("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", "WSHARK", "WSHARK");
  }

  return (
    <>
      <div>
        {transfers.length > 0 ? (
          transfers.map((x) => <TransferCard transfer={x} />)
        ) : (
          <div>
            <p>No transfers</p>
          </div>
        )}
      </div>
      <button onClick={setup}>SETUP</button>
    </>
  );
};

export default TransferList;
