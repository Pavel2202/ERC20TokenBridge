import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useWeb3Contract } from "react-moralis";
import { addresses, abi } from "@/constants";

const Transfer = () => {
  let account;

  const [provider, setProvider] = useState({});

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

  async function onPermit(bridge, owner, spender, provider, amount) {
    //const nonce = (await bridge.functions.tokenNonce(tokenAddress)).toString();
    const nonce = "3";
    const deadline = +new Date() + 60 * 60;

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    console.log(chainId);

    const domain = {
      name: "TokenShark",
      version: "1",
      chainId: chainId,
      verifyingContract: tokenAddress,
    };

    console.log(domain);

    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const permit = {
      owner: owner,
      spender: spender,
      value: amount.toString(),
      nonce: nonce,
      deadline: deadline,
    };

    console.log(permit);

    const data = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Permit: Permit,
      },
      domain: domain,
      primaryType: "Permit",
      message: permit,
    });

    const signatureLike = await provider.send("eth_signTypedData_v4", [
      owner,
      data,
    ]);

    const signature = ethers.utils.splitSignature(signatureLike);
    return {
      v: signature.v,
      r: signature.r,
      s: signature.s,
      deadline,
    };
  }

  async function depositToBridgeCall(e) {
    e.preventDefault();
    await setup();
    const ethBridge = new ethers.Contract(
      "0xc6Bb725aeF2c8c5107eC292fBCEca1e8a73c8Ff8",
      abi,
      provider.getSigner()
    );

    let formData = new FormData(e.target);

    let to = formData.get("to");
    let token = formData.get("token");
    let amount = formData.get("amount");

    console.log(typeof amount);

    const { v, r, s, deadline } = await onPermit(
      ethBridge,
      account,
      ethBridge.address,
      provider,
      ethers.utils.parseUnits("1", 18)
    );

    console.log(v);
    console.log(r);
    console.log(s);
    console.log(deadline);

    let depositData = {
      to: account,
      token: tokenAddress,
      targetBridge: "0x51DCEF1dFA8BE29f2E94351A081E77480896adE6",
      amount: ethers.utils.parseUnits("1", 18),
      deadline: deadline,
    };

    let signatureData = {
      v: v,
      r: r,
      s: s,
    };

    await ethBridge.functions.deposit(depositData, signatureData, {
      gasLimit: 30000000,
    });
  }

  return (
    <>
      <form onSubmit={depositToBridgeCall}>
        <div className="mb-6">
          <label className="inline text-gray-700 text-sm font-bold mb-2 mr-2">
            To
          </label>
          <input
            type="text"
            id="to"
            name="to"
            className="w-1/4 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          ></input>
        </div>
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
          SEND
        </button>
      </form>
    </>
  );
};

export default Transfer;
