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
    </>
  );
};

export default TransferList;
