import { ethers } from "ethers";
import { useWeb3Contract } from "react-moralis";
import { addresses, abi } from "@/constants";

const Main = () => {
  if (typeof window !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let account = ethereum.selectedAddress;

    let chainId, bridgeAddress, tokenAddress;

    async function setup() {
      chainId = await (await provider.getNetwork()).chainId;
      bridgeAddress = addresses[chainId];
      tokenAddress = "0xBE279442db8ab10c5f2Cc7B3caCdeb1538e3Ac4F";
    }

    async function onPermit(owner, spender, provider, amount) {
      const nonce = await provider.getTransactionCount(owner);
      const deadline = +new Date() + 60 * 60;

      const domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ];

      const domain = {
        name: "SharkToken",
        version: "1",
        chainId: chainId,
        verifyingContract: tokenAddress,
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
        nonce: nonce.toString(16),
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

      const signatureLike = await signer.provider.send("eth_signTypedData_v4", [
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

    async function sendToBridgeCall() {
      await setup();
      const bridge = new ethers.Contract(bridgeAddress, abi, signer);
      const { v, r, s, deadline } = await onPermit(
        account,
        bridgeAddress,
        provider,
        1,
      );
        console.log(v);
        console.log(r);
        console.log(s);
        console.log(deadline);
      console.log("permited");

      await bridge.functions.sendToBridge(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        tokenAddress,
        1,
        deadline,
        v,
        r,
        s
      );
    }

    return (
      <div>
        <button onClick={sendToBridgeCall}>SEND</button>
      </div>
    );
  }

  return (
    <div>
      <button>SEND</button>
    </div>
  );
};

export default Main;
