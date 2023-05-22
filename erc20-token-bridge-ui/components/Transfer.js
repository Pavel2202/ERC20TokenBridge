import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import { tokenAddresses, tokenAbi } from "@/constants/Token";

const Transfer = () => {
  let account;

  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  let chainId, bridgeAddress, tokenAddress;

  async function setup() {
    chainId = await (await provider.getNetwork()).chainId;
    account = ethereum.selectedAddress;
    bridgeAddress = bridgeAddresses[chainId][0];
    tokenAddress = tokenAddresses[chainId][0];
  }

  async function onPermit(owner, spender, provider, amount, tokenContract) {
    const nonce = await tokenContract.nonces(owner);
    const tokenName = (await tokenContract.name()).toString();
    const deadline = +new Date() + 60 * 60;

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const domain = {
      name: tokenName,
      version: "1",
      chainId: chainId,
      verifyingContract: tokenContract.address,
    };

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
      nonce: nonce.toHexString(),
      deadline: deadline,
    };

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

    let formData = new FormData(e.target);

    let to = formData.get("to");
    let targetBridgeIndex = formData.get("bridge");
    let targetBridge = bridgeAddresses[chainId][targetBridgeIndex];
    let tokenIndex = formData.get("token");
    let token = tokenAddresses[chainId][tokenIndex];
    let amount = formData.get("amount");

    const bridge = new ethers.Contract(
      bridgeAddresses[chainId][0],
      bridgeAbi,
      provider.getSigner()
    );

    const tokenContract = new ethers.Contract(
      token,
      tokenAbi,
      provider.getSigner()
    );

    const { v, r, s, deadline } = await onPermit(
      account,
      bridge.address,
      provider,
      ethers.utils.parseUnits(amount, 18),
      tokenContract
    );

    let depositData = {
      to: to,
      token: token,
      targetBridge: targetBridge,
      amount: ethers.utils.parseUnits(amount, 18),
      deadline: deadline,
    };

    console.log(depositData);

    let signatureData = {
      v: v,
      r: r,
      s: s,
    };

    await bridge.functions.deposit(depositData, signatureData, {
      gasLimit: 30000000,
    });
  }

  async function ready(e) {
    e.preventDefault();
    await setup();

    const bridge = new ethers.Contract(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      bridgeAbi,
      provider.getSigner()
    );

    await bridge.functions.addBridge(
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    );

    let recepientBridge = new ethers.Contract(
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      bridgeAbi,
      provider.getSigner()
    );

    await recepientBridge.functions.addBridge(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
    await bridge.functions.addToken(tokenAddress);
    await recepientBridge.functions.addToken(tokenAddress);

    await recepientBridge.functions.createWrappedToken(
      tokenAddress,
      "WSHARK",
      "WSHARK"
    );  

    const token = new ethers.Contract(
      tokenAddress,
      tokenAbi,
      provider.getSigner()
    );

    await token.functions.mint(account, ethers.utils.parseUnits("100", 18));
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
            Bridge
          </label>
          <select
            name="bridge"
            id="bridge"
            className="inline appearance-none bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="0">Ethereum</option>
            <option value="1">Polygon</option>
          </select>
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
            <option value="0">SHARK</option>
            <option value="1">WSHARK</option>
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

      <button onClick={ready}>Setup</button>
    </>
  );
};

export default Transfer;
