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
      tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    }

    async function onPermit(bridge, owner, spender, provider, amount) {
      //const nonce = ethers.BigNumber.from(await provider.getTransactionCount(tokenAddress) - 1);
      console.log(bridge.functions);
      const nonce = (await bridge.functions.tokenNonce(tokenAddress)).toString();
      console.log(nonce);
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
        nonce: nonce,
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

    async function sendToBridgeCall() {
      await setup();
      const bridge = new ethers.Contract(bridgeAddress, abi, signer);
      const { v, r, s, deadline } = await onPermit(
        bridge,
        account,
        bridgeAddress,
        provider,
        ethers.utils.parseUnits("1", 18)
      );

      await bridge.functions.sendToBridge(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        tokenAddress,
        ethers.utils.parseUnits("1", 18),
        deadline,
        v,
        r,
        s
      );
    }

    async function withdrawFromBridgeCall() {
      await setup();
      const bridge = new ethers.Contract(bridgeAddress, abi, signer);

      let tx = await bridge.functions.withdrawFromBridge(
        account,
        tokenAddress,
        ethers.utils.parseUnits("1", 18)
      );
      await tx.wait(1);
      console.log(tx);
    }

    return (
      <div>
        <form>
          <div>
            Choose token
            <select>
              <option>SHARK</option>
              <option>LIME</option>
            </select>
          </div>
          <div>
            <label>To</label>
            <input></input>
          </div>
          <div>
            <label>Amount</label>
            <input></input>
          </div>
        </form>

        <div>
          <button onClick={sendToBridgeCall}>SEND</button>
          <button onClick={withdrawFromBridgeCall}>CLAIM</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form>
        <div>
          Choose token
          <select>
            <option>SHARK</option>
            <option>LIME</option>
          </select>
        </div>
        <div>
          <label>To</label>
          <input></input>
        </div>
        <div>
          <label>Amount</label>
          <input></input>
        </div>
      </form>

      <div>
        <button>SEND</button>
        <button>CLAIM</button>
      </div>
    </div>
  );
};

export default Main;
