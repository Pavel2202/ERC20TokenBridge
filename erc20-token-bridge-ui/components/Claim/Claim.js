import { useState, useEffect } from "react";
import TransferList from "./TransferList";

const Claim = () => {
  const [tranfers, setTransfers] = useState([]);

  const networks = {
    polygon: {
      chainId: `0x${Number(80001).toString(16)}`,
      chainName: "Mumbai Testnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"],
    },
    sepolia: {
      chainId: `0x${Number(11155111).toString(16)}`,
      chainName: "Sepolia",
      nativeCurrency: {
        name: "SEP",
        symbol: "SEP",
        decimals: 18,
      },
      rpcUrls: ["https://rpc.sepolia.org"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    },
  };

  const changeNetwork = async (networkName) => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  };

  useEffect(() => {
    fetch("http://localhost:3001/transfers")
      .then((res) => res.json())
      .then((data) => {
        const account = ethereum.selectedAddress;
        setTransfers(
          data.filter((x) => x.to == account && x.isClaimed == false)
        );
      });
  }, []);

  return (
    <>
      <div>
        <button onClick={() => changeNetwork("polygon")}>
          Change to Mumbai
        </button>
        <button onClick={() => changeNetwork("sepolia")}>
          Change to Sepolia
        </button>
      </div>

      <div>
        <TransferList transfers={tranfers}></TransferList>
      </div>
    </>
  );
};

export default Claim;
