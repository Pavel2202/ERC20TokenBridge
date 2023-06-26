import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";

const BlockNumber = () => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  let providerRpcUrl;

  const [blockNumber, setBlockNumber] = useState(0);

  useEffect(() => {
    setBlockNumber(0);
  }, [chainId]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  provider.on("block", (newBlockNumber) => {
    if (newBlockNumber > blockNumber) {
      setBlockNumber(newBlockNumber);
    }
  });

  return <p className="absolute float-left">{blockNumber}</p>;
};

export default BlockNumber;
