import { useState, useEffect } from "react";
import TransferList from "./TransferList";

const Claim = () => {
  const [tranfers, setTransfers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/transfers")
      .then((res) => res.json())
      .then((data) => {
        const account = ethereum.selectedAddress;
        setTransfers(
          data.filter((x) => x.to.toLowerCase() == account.toLowerCase() && x.isClaimed == false)
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
