import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";

const BlockNumber = () => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const [provider, setProvider] = useState({});
  const [blockNumber, setBlockNumber] = useState(0);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, [chainId]);

  useEffect(() => {
    setBlockNumber(provider._lastBlockNumber);
  }, [provider]);

  if (Object.keys(provider).length > 0) {
    provider.on("block", (newBlockNumber) => {
      if (newBlockNumber > blockNumber) {
        setBlockNumber(newBlockNumber);
      }
    });
  }

  return <p className="absolute float-left">{blockNumber}</p>;
};

export default BlockNumber;
