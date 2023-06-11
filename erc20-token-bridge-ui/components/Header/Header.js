import Link from "next/link";
import Image from "next/image";
import { useMoralis } from "react-moralis";
import { ConnectButton } from "web3uikit";

const Header = () => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const networks = {
    mumbai: {
      chainId: `0x${Number(80001).toString(16)}`,
      chainName: "Mumbai Testnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"],
    },
    sepolia: {
      chainId: `0x${Number(11155111).toString(16)}`,
      chainName: "Sepolia",
      nativeCurrency: {
        name: "SEP",
        symbol: "SEP",
        decimals: 18,
      },
      rpcUrls: ["https://rpc.sepolia.org"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    },
  };

  const changeNetwork = async (networkName) => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });
  };

  async function changeNetworkHandler(e) {
    e.preventDefault();
    changeNetwork(e.currentTarget.id);
  }

  return (
    <header className="border-b md:flex md:items-center md:justify-between p-4 pb-0 shadow-lg md:pb-4">
      <div className="flex items-center justify-between mb-4 md:mb-0">
        <h1 className="leading-none text-2xl text-grey-darkest">
          <Link href="/" className="py-4 px-4 font-bold text-3xl">
            ERC20 Token Bridge
          </Link>
        </h1>
      </div>

      <nav>
        <ul className="list-reset md:flex md:items-center">
          <li className="md:ml-4">
            <Link href="/transfer" className="inline py-2 px-4 text-black-400">
              Transfer
            </Link>
          </li>
          <li className="md:ml-4">
            <Link href="/claim" className="inline py-2 px-4 text-black-400">
              Claim
            </Link>
          </li>
          <li className="md:ml-4">
            <Link href="/history" className="inline py-2 px-4 text-black-400">
              History
            </Link>
          </li>
          <li className="md:ml-4">
            {chainId == 11155111 ? (
              <button
                onClick={changeNetworkHandler}
                id="mumbai"
                className="inline py-2 px-4 text-black-400"
              >
                <Image src={"https://cdn.iconscout.com/icon/free/png-256/free-polygon-token-4086724-3379854.png"} alt="text" width={40} height={40} />
              </button>
            ) : (
              <button
                onClick={changeNetworkHandler}
                id="sepolia"
                className="inline py-2 px-4 text-black-400"
              >
                <Image src={"https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png"} alt="text" width={40} height={40} />
              </button>
            )}
          </li>
          <li className="flex flex-row">
            <ConnectButton moralisAuth={false} />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
