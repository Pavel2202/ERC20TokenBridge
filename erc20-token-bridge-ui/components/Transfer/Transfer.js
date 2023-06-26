import { ethers, BigNumber } from "ethers";
import { useState, useEffect } from "react";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { useMoralis } from "react-moralis";
import { useNotification } from "web3uikit";
import { bridgeAddresses, bridgeAbi } from "@/constants/Bridge";
import { tokenAbi } from "@/constants/Token";
import BlockNumber from "../BlockNumber/BlockNumber";

const Transfer = () => {
  const { chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const bridgeAddress =
    chainId in bridgeAddresses ? bridgeAddresses[chainId] : null;

  const dispatch = useNotification();

  const [provider, setProvider] = useState({});
  const [tokens, setTokens] = useState({});

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
      startMoralis();
      getTokens();
    }
  }, [chainId]);

  useEffect(() => {
    populateTokenSelect();
  }, [tokens]);

  async function startMoralis() {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
    }
  }

  async function getTokens() {
    const address = ethereum.selectedAddress;
    const chain = EvmChain.SEPOLIA;
    const userTokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain,
    });
    setTokens(userTokens.toJSON());
  }

  async function populateTokenSelect() {
    let selectElement = document.getElementById("token");
    selectElement.innerHTML = "";

    for (let index = 0; index < tokens.length; index++) {
      const currentToken = tokens[index];
      selectElement.innerHTML =
        selectElement.innerHTML +
        `<option value="${currentToken.token_address}">${currentToken.name}</option>`;
    }
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

  async function depositToBridge(e) {
    try {
      e.preventDefault();

      if (bridgeAddress == null) {
        throw new Error("Invalid chain");
      }

      const account = ethereum.selectedAddress;
      const bridge = new ethers.Contract(
        bridgeAddress,
        bridgeAbi,
        provider.getSigner()
      );

      let formData = new FormData(e.target);
      let to = formData.get("to");
      let token = formData.get("token");
      //let token = "0xEF432827A7F0B0bE03c36B1104E5A3e1081D3D21";
      let amount = formData.get("amount");

      let tx;

      if (chainId == 11155111) {
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

        const feeData = await provider.getFeeData();
        tx = await bridge.functions.lock(
          to,
          token,
          ethers.utils.parseUnits(amount, 18),
          signatureData,
          {
            value: ethers.utils.parseEther("0.0000001"),
            maxFeePerGas: BigNumber.from(feeData.maxFeePerGas),
            maxPriorityFeePerGas: BigNumber.from(feeData.maxPriorityFeePerGas),
          }
        );
      } else if (chainId == 80001) {
        const wtoken = await bridge.tokenToWrappedToken(token);

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

        tx = await bridge.functions.burn(
          to,
          token,
          ethers.utils.parseUnits(amount, 18),
          signatureData
        );
      } else {
        throw new Error("Invalid chain");
      }

      e.target.reset();
      await tx.wait();
      handleSuccess(token);
    } catch (err) {
      console.log(err.message);
      handleError(err.message);
    }
  }

  function handleSuccess(token) {
    dispatch({
      type: "success",
      message: "Transfered " + token,
      title: "Tx Notification",
      position: "topR",
    });
  }

  function handleError(message) {
    dispatch({
      type: "error",
      message: message,
      title: "Error Notification",
      position: "topR",
    });
  }

  return (
    <div>
      <BlockNumber />
      <h1 className="mb-3 flex items-center justify-center font-bold text-xl">
        Transfer
      </h1>
      <div className="mb-3 flex items-center justify-center ">
        <form onSubmit={depositToBridge}>
          <div className="mb-6">
            <label className="inline text-gray-700 text-sm font-bold mb-2 mr-2">
              To
            </label>
            <input
              type="text"
              id="to"
              name="to"
              className="w-96 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            ></select>
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
          <button className="ml-28 shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded">
            SEND
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;
