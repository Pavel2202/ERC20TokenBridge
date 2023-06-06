import HistoryCard from "./HistoryCard";

const HistoryList = ({ transfers }) => {
  return (
    <>
      <div>
        {transfers.length > 0 ? (
          transfers.map((x) => <HistoryCard key={x._id} transfer={x} />)
        ) : (
          <div>
            <p>No transfers</p>
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryList;
