import Link from "next/link";
import BlockNumber from "../BlockNumber/BlockNumber";

const HomePage = () => {
  return (
    <>
      <BlockNumber />
      <h1 className="mb-3 flex items-center justify-center font-bold text-xl">
        ERC20 Token Bridge
      </h1>
      <h3 className="mb-3 flex items-center justify-center font-bold text-lg">
        You can use this bridge to transfer tokens between EVM based networks
      </h3>

      <h3 className="mb-3 flex items-center justify-center">
        <Link
          href="/transfer"
          className="shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        >
          Start Bridging
        </Link>
      </h3>
    </>
  );
};

export default HomePage;
