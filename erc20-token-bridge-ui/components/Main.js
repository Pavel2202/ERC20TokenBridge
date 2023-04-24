import { ethers } from "ethers";
import { useWeb3Contract } from "react-moralis";
import { addresses, abi } from "@/constants";

const Main = () => {
  if (typeof window !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let account = ethereum.selectedAddress;

    let chainId, ethBridgeAddress, polygonBridgeAddress, tokenAddress;

    async function setup() {
      chainId = await (await provider.getNetwork()).chainId;
      ethBridgeAddress = addresses[chainId][0];
      polygonBridgeAddress = addresses[chainId][1];
      tokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    }

    async function onPermit(bridge, owner, spender, provider, amount) {
      const nonce = (
        await bridge.functions.tokenNonce(tokenAddress)
      ).toString();
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

    async function depositToBridgeCall() {
      await setup();
      const ethBridge = new ethers.Contract(ethBridgeAddress, abi, signer);
      const polygonBridge = new ethers.Contract(
        polygonBridgeAddress,
        abi,
        signer
      );

      const { v, r, s, deadline } = await onPermit(
        ethBridge,
        account,
        ethBridgeAddress,
        provider,
        ethers.utils.parseUnits("1", 18)
      );

      //await ethBridge.functions.addToken(tokenAddress);
      //await polygonBridge.functions.addToken(tokenAddress);
      // await ethBridge.functions.addBridge(ethBridgeAddress);
      // await polygonBridge.functions.addBridge(polygonBridgeAddress);
      // await polygonBridge.functions.addBridge(ethBridgeAddress);

      let depositData = {
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        token: tokenAddress,
        targetBridge: polygonBridgeAddress,
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

    async function withdrawFromBridgeCall() {
      await setup();
      const polygonBridge = new ethers.Contract(
        polygonBridgeAddress,
        abi,
        signer
      );
        console.log(account);
      console.log(await polygonBridge.functions.supportedTokens(tokenAddress));
      console.log(await polygonBridge.functions.balance(account, tokenAddress));

      let withdrawData = {
        token: tokenAddress,
        amount: ethers.utils.parseUnits("1", 18),
      };

      console.log(await polygonBridge.functions.tokenToWrappedToken(tokenAddress));

      let tx = await polygonBridge.functions.withdraw(withdrawData, {
        gasLimit: 30000000,
      });
      await tx.wait(1);
      console.log(tx);
    }

    async function mint() {
      await setup();
      const tokenAbi = [
        {
          inputs: [
            {
              internalType: "string",
              name: "_name",
              type: "string",
            },
            {
              internalType: "string",
              name: "_symbol",
              type: "string",
            },
            {
              internalType: "address",
              name: "_owner",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          inputs: [],
          name: "DOMAIN_SEPARATOR",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "burn",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "burnFrom",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "mint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
          ],
          name: "nonces",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
            {
              internalType: "uint8",
              name: "v",
              type: "uint8",
            },
            {
              internalType: "bytes32",
              name: "r",
              type: "bytes32",
            },
            {
              internalType: "bytes32",
              name: "s",
              type: "bytes32",
            },
          ],
          name: "permit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];
      const token = new ethers.Contract(tokenAddress, tokenAbi, signer);

      await token.functions.mint(account, ethers.utils.parseUnits("100", 18));
    }

    async function wrapToken() {
      await setup();
      const polygonBridge = new ethers.Contract(
        polygonBridgeAddress,
        abi,
        signer
      );

      await polygonBridge.functions.createWrappedToken(tokenAddress, "WShark", "WSHARK");
      console.log(await polygonBridge.functions.tokenToWrappedToken(tokenAddress));
    }

    return (
      <div>
        <form>
          <div>
            Choose token
            <select>
              <option>SHARK</option>
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
          <button onClick={depositToBridgeCall}>SEND</button>
          <button onClick={withdrawFromBridgeCall}>CLAIM</button>
          <button onClick={mint}>MINT</button>
          <button onClick={wrapToken}>WRAP</button>
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
        <button>MINT</button>
      </div>
    </div>
  );
};

export default Main;
