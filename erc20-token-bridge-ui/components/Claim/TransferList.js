import TransferCard from "./TransferCard";

const TransferList = ({ transfers }) => {
  return (
    <div className="items-stretch justify-center">
      {transfers.length > 0 ? (
        transfers.map((x) => <TransferCard key={x._id} transfer={x} />)
      ) : (
        <div>
          <p className="mb-3 flex items-stretch justify-center">No transfers</p>
        </div>
      )}
    </div>
  );
};

export default TransferList;
