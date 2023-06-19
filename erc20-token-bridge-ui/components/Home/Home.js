import Link from "next/link";

const HomePage = () => {
  return (
    <>
      <h1 className="mb-3 ml-[900px] grid grid-cols-2 font-bold text-xl">ERC20 Token Bridge</h1>
      <h3 className="mb-3 ml-[700px] grid grid-cols-1 font-bold text-lg">
        You can use this bridge to transfer tokens between EVM based networks
      </h3>

      <h3 className="mb-3 ml-[950px] grid grid-cols-2">
      <Link
          href="/transfer"
          className="mr-auto shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        >
          Start Bridging
        </Link>
      </h3>
    </>
  );
};

export default HomePage;
