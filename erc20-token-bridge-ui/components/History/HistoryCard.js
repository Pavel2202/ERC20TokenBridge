import { ethers } from "ethers";

const HistoryCard = ({ transfer }) => {
  return (
      <div className="mb-3 ml-[600px] grid grid-cols-2">
        <div className="mr-5 border-solid border-4 rounded-md border-black">
          <span className="mr-6">
            From: {transfer.from.slice(0, 6)}...
            {transfer.from.slice(transfer.from.length - 4)}
          </span>{" "}
          <span className="mr-6">
            To: {transfer.to.slice(0, 6)}...
            {transfer.from.slice(transfer.to.length - 4)}
          </span>
          <span className="mr-6">
            Token: {transfer.token.slice(0, 6)}...
            {transfer.token.slice(transfer.token.length - 4)}
          </span>{" "}
          <span className="mr-6">Amount: {ethers.utils.formatUnits(transfer.amount.toString(), "ether")}</span>
        </div>
      </div>
  );
};

export default HistoryCard;
