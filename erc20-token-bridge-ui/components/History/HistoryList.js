import HistoryCard from "./HistoryCard";

const HistoryList = ({ transfers }) => {
  return (
    <div className="items-stretch justify-center">
      {transfers.length > 0 ? (
        transfers.map((x) => <HistoryCard key={x._id} transfer={x} />)
      ) : (
        <div>
          <p className="mb-3 flex items-stretch justify-center">No history to display</p>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
