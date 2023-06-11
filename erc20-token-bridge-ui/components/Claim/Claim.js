import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import TransferList from "./TransferList";

const Claim = () => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const chainName = chainId == 80001 ? "Mumbai" : "Sepolia";

  const [tranfers, setTransfers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/transfers")
      .then((res) => res.json())
      .then((data) => {
        const account = ethereum.selectedAddress;
        setTransfers(
          data.filter((x) => x.to.toLowerCase() == account.toLowerCase() && x.isClaimed == false && x.toBridge == chainName)
        );
      });
  }, []);

  return (
    <>
        <TransferList transfers={tranfers}></TransferList>
    </>
  );
};

export default Claim;
