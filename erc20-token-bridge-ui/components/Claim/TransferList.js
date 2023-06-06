import TransferCard from "./TransferCard";

const TransferList = ({ transfers }) => {
  return (
    <>
      <div>
        {transfers.length > 0 ? (
          transfers.map((x) => <TransferCard key={x._id} transfer={x} />)
        ) : (
          <div>
            <p>No transfers</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TransferList;
