import TransferCard from "./TransferCard";

const TransferList = ({ transfers }) => {
  console.log(transfers);
  return (
    <>
      {transfers.length > 0 ? (
        transfers.map((x) => <TransferCard transfer={x}/>)
      ) : (
        <div>
          <p>No transfers</p>
        </div>
      )}
    </>
  );
};

export default TransferList;
