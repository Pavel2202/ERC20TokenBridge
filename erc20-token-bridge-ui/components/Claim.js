import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import { tokenAddresses, tokenAbi } from "@/constants/Token";
import TransferList, { transferList } from "./TransferList";

const Claim = () => {
  let account;

  const [provider, setProvider] = useState({});
  const [tranfers, setTransfers] = useState([]);

  const networks = {
    polygon: {
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
      rpcUrls: ["https://rpc.sepolia.dev"],
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

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  let chainId, bridgeAddress, tokenAddress;

  async function setup() {
    chainId = await (await provider.getNetwork()).chainId;
    account = ethereum.selectedAddress;
    bridgeAddress = bridgeAddresses[31337][0];
    tokenAddress = tokenAddresses[chainId];
  }

  async function withdrawFromBridgeCall(e) {
    e.preventDefault();

    console.log(chainId);

    await setup();

    const bridge = new ethers.Contract(
      bridgeAddress,
      bridgeAbi,
      provider.getSigner()
    );

    let formData = new FormData(e.target);

    let token = formData.get("token");
    let amount = formData.get("amount");

    let withdrawData = {
      token: token,
      amount: ethers.utils.parseUnits(amount, 18),
    };

    console.log(withdrawData);
    console.log(bridge);

    await bridge.functions.createWrappedToken(token, "WSHARK", "WSHARK");

    console.log(await bridge.functions.tokenToWrappedToken(token));

    let tx = await bridge.functions.withdraw(withdrawData, {
      gasLimit: 30000000,
    });
    await tx.wait(1);
    console.log(tx);
  }

  async function generateTransfers() {
    await fetch("http://localhost:3001/transfers")
      .then((res) => res.json())
      .then((data) => setTransfers(data));
  }

  return (
    <>
      <form onSubmit={withdrawFromBridgeCall}>
        <div className="inline-block relative w-64 mb-6">
          <label className="inline text-gray-700 text-sm font-bold mb-2 mr-2">
            Token
          </label>
          <select
            name="token"
            id="token"
            className="inline appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0">
              SHARK
            </option>
          </select>
        </div>
        <div className="mb-6">
          <label className="inline text-gray-700 text-sm font-bold mb-2 mr-2">
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            className="w-1/8 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          ></input>
        </div>
        <button className="shadow bg-lime-500 hover:bg-lime-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded">
          CLAIM
        </button>
      </form>

      <div>
        <button onClick={() => changeNetwork("polygon")}>
          Change to Mumbai
        </button>
        <button onClick={() => changeNetwork("sepolia")}>
          Change to Sepolia
        </button>
      </div>

      <div>
        <button onClick={generateTransfers}>Get All</button>
      </div>

      <div>
        <TransferList transfers={tranfers}></TransferList>
      </div>
    </>
  );
};

export default Claim;
