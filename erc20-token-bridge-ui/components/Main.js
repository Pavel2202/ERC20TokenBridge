import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { addresses, abi } from "@/constants";

const Main = () => {
  if (typeof window !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let account = ethereum.selectedAddress;

    const ethBridgeAddress = addresses[31337][0];
    const polygonBridgeAddress = addresses[31337][1];

    const ethBridge = new ethers.Contract(ethBridgeAddress, abi, signer);

    async function onPermit(owner, spender, contract, provider, amount) {
      //const nonce = await contract.nonces(owner);
      const nonce = 2;
      const deadline = +new Date() + 60 * 60;

      const domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ];

      const chainId = await (await provider.getNetwork()).chainId;
      const domain = {
        name: "TokenShark",
        version: "1",
        chainId: chainId,
        verifyingContract: contract.address,
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

    async function sendToBridge() {
      const { v, r, s, deadline } = await onPermit(
        account,
        ethBridgeAddress,
        ethBridge,
        provider,
        100
      );

      console.log(v);
      console.log(r);
      console.log(s);
      console.log(deadline);
    }

    return (
      <div>
        <button
          onClick={sendToBridge}
        ></button>
      </div>
    );
  }

  return (
    <div>
      <button></button>
    </div>
  );
};

export default Main;
