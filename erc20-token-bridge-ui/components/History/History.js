import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { useRouter } from "next/router";
import HistoryList from "./HistoryList";
import Pagination from "../Pagination/Pagination";

const History = () => {
  const baseUrl = "http://localhost:3001";

  const router = useRouter();
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const [tranfers, setTransfers] = useState([]);
  const [pages, setPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [account, setAccount] = useState("");

  useEffect(() => {
    fetch(
      `${baseUrl}/pages/?chainId=${chainId.toString()}&account=${account}&claimed=true`
    )
      .then((res) => res.json())
      .then((data) => {
        setPages(data);
      });
  }, []);

  useEffect(() => {
    const currentPage = router.query.page === undefined ? 1 : router.query.page;
    setPageNumber(currentPage);
    setAccount(ethereum.selectedAddress);
  }, [router]);

  useEffect(() => {
    fetch(
      `${baseUrl}/transfers/?page=${pageNumber}&chainId=${chainId.toString()}&account=${account}&claimed=true`
    )
      .then((res) => res.json())
      .then((data) => {
        setTransfers(data);
      });
  }, [pageNumber, chainId]);

  return (
    <div className="overflow-hidden">
      <h1 className="mb-3 flex items-center justify-center font-bold text-xl" >History</h1>
      <HistoryList transfers={tranfers}></HistoryList>
      <Pagination routeName="history" page={pageNumber} pagesCount={pages} />
    </div>
  );
};

export default History;
