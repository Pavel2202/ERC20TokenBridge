import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import Link from "next/link";
import TransferList from "./TransferList";

const Claim = () => {
  const router = useRouter();
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const chainName = chainId == 80001 ? "Mumbai" : "Sepolia";

  const [tranfers, setTransfers] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [account, setAccount] = useState("");

  useEffect(() => {
    setPageNumber(router.query.page);
    setAccount(ethereum.selectedAddress);
  }, [router]);

  useEffect(() => {
    fetch(`http://localhost:3001/transfers/?page=${pageNumber}&chainName=${chainName}&account=${account}`)
      .then((res) => res.json())
      .then((data) => {
        setTransfers(
          //data.filter((x) => x.to.toLowerCase() == account.toLowerCase() && x.isClaimed == false && x.toBridge == chainName)
          data
        );
      });
  }, [pageNumber]);

  return (
    <>
      <TransferList transfers={tranfers}></TransferList>

      <Link href="/claim/?page=1">page 1</Link>
      <Link href="/claim/?page=2">page 2</Link>
      <Link href="/claim/?page=3">page 3</Link>
    </>
  );
};

export default Claim;
