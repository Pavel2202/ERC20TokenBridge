import { useState, useEffect } from "react";
import HistoryList from "./HistoryList";

const History = () => {
  const [tranfers, setTransfers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/transfers")
      .then((res) => res.json())
      .then((data) => {
        setTransfers(data.filter((x) => x.isClaimed == true));
      });
  }, []);

  return (
    <>
      <HistoryList transfers={tranfers}></HistoryList>
    </>
  );
};

export default History;
