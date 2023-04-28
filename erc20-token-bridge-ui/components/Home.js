import Link from "next/link";

const HomePage = () => {
  return (
    <>
      <h1>ERC20 Token Bridge</h1>
      <h3>
        You can use this bridge to transfer tokens between EVM based networks
      </h3>

      <h3>
        <strong>Start Bridging</strong>
      </h3>

      <Link href="/transfer" className="inline py-2 px-4 text-black-400">
        Transfer
      </Link>
    </>
  );
};

export default HomePage;
