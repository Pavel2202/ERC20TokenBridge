import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import { tokenAddresses, tokenAbi } from "@/constants/Token";

const Transfer = () => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const bridgeAddress =
    chainId in bridgeAddresses ? bridgeAddresses[chainId] : null;

  const [provider, setProvider] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

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

  async function depositToBridge(e) {
    e.preventDefault();
    const account = ethereum.selectedAddress;
    let formData = new FormData(e.target);

    let to = formData.get("to");
    let token = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    let amount = formData.get("amount");

    if (chainId == 31337) {
      const bridge = new ethers.Contract(
        bridgeAddress[0],
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

      let signatureData = {
        deadline: deadline,
        v: v,
        r: r,
        s: s,
      };

      await bridge.functions.lock(
        to,
        token,
        ethers.utils.parseUnits(amount, 18),
        signatureData,
        {
          value: 100000000000,
          gasLimit: 30000000,
        }
      );
    } else {
      const bridge = new ethers.Contract(
        bridgeAddress[1],
        bridgeAbi,
        provider.getSigner()
      );

      const wtoken = await bridge.tokenToWrappedToken(token);
      console.log(wtoken);

      const tokenContract = new ethers.Contract(
        wtoken,
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

      let signatureData = {
        deadline: deadline,
        v: v,
        r: r,
        s: s,
      };

      await bridge.functions.burn(
        to,
        token,
        ethers.utils.parseUnits(amount, 18),
        signatureData,
        {
          gasLimit: 30000000,
        }
      );
    }
  }

  async function startMint(e) {
    e.preventDefault();
    const tokenAddress =
      chainId in tokenAddresses ? tokenAddresses[chainId] : null;

    const token = new ethers.Contract(
      tokenAddress,
      tokenAbi,
      provider.getSigner()
    );

    await token.functions.mint(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ethers.utils.parseUnits("100", 18)
    );
  }

  return (
    <>
      <form onSubmit={depositToBridge}>
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

      <button onClick={startMint}>Setup</button>
    </>
  );
};

export default Transfer;
