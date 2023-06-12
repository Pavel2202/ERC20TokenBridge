import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import TransferList from "./TransferList";
import Pagination from "../Pagination/Pagination";

const Claim = () => {
  const baseUrl = "http://localhost:3001";

  const router = useRouter();
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const chainName = chainId == 80001 ? "Mumbai" : "Sepolia";

  const [tranfers, setTransfers] = useState([]);
  const [pages, setPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [account, setAccount] = useState("");

  useEffect(() => {
    fetch(
      `${baseUrl}/pages/?chainName=${chainName}&account=${account}&claimed=false`
    )
      .then((res) => res.json())
      .then((data) => {
        setPages(data);
      });
  });

  useEffect(() => {
    const currentPage = router.query.page === undefined ? 1 : router.query.page;
    setPageNumber(currentPage);
    setAccount(ethereum.selectedAddress);
  }, [router]);

  useEffect(() => {
    fetch(
      `${baseUrl}/transfers/?page=${pageNumber}&chainName=${chainName}&account=${account}&claimed=false`
    )
      .then((res) => res.json())
      .then((data) => {
        setTransfers(data);
      });
  }, [pageNumber]);

  return (
    <>
      <TransferList transfers={tranfers} />
      <Pagination routeName="claim" page={pageNumber} pagesCount={pages} />
    </>
  );
};

export default Claim;
