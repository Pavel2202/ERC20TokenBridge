import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { addresses, abi } from "@/constants/Bridge";

const Claim = () => {
  let account;

  const [provider, setProvider] = useState({});
  const [tranfers, setTransfers] = useState([]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  let chainId, ethBridgeAddress, polygonBridgeAddress, tokenAddress;

  async function setup() {
    chainId = await (await provider.getNetwork()).chainId;
    account = ethereum.selectedAddress;
    ethBridgeAddress = addresses[chainId][0];
    polygonBridgeAddress = addresses[chainId][1];
    tokenAddress = "0x77178b6Ad0B8E32de01dF6C0bF8339f15f3E60C6";
  }

  async function withdrawFromBridgeCall(e) {
    e.preventDefault();
    await fetch("http://localhost:3001/transfers")
      .then((res) => res.json())
      .then((data) => setTransfers(data));
    console.log(tranfers);
    await setup();
    const polygonBridge = new ethers.Contract(
      "0x51DCEF1dFA8BE29f2E94351A081E77480896adE6",
      abi,
      provider.getSigner()
    );

    let formData = new FormData(e.target);

    let token = formData.get("token");
    let amount = formData.get("amount");

    let withdrawData = {
      token: tokenAddress,
      amount: ethers.utils.parseUnits("1", 18),
    };

    // console.log(
    //   await polygonBridge.functions.tokenToWrappedToken(tokenAddress)
    // );

    // let tx = await polygonBridge.functions.withdraw(withdrawData, {
    //   gasLimit: 30000000,
    // });
    // await tx.wait(1);
    // console.log(tx);
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
    </>
  );
};

export default Claim;
