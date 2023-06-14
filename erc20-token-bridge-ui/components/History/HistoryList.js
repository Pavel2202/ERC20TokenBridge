import HistoryCard from "./HistoryCard";

const HistoryList = ({ transfers }) => {
  return (
      <div className="w-max m-5">
        {transfers.length > 0 ? (
          transfers.map((x) => <HistoryCard key={x._id} transfer={x} />)
        ) : (
          <div>
            <p>No history to display</p>
          </div>
        )}
      </div>
  );
};

export default HistoryList;
