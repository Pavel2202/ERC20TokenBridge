import { ethers } from "ethers";
import {
  tokenUsdcContractAddresses,
  tokenUsdcAbi,
} from "@/constants/TokenUsdc";
import {
  tokenSharkContractAddresses,
  tokenSharkAbi,
} from "@/constants/TokenShark";
import {
  ethBridgeContractAddresses,
  ethBridgeAbi,
} from "../constants/EthBridge";
import {
  bscBridgeContractAddresses,
  bscBridgeAbi,
} from "../constants/BscBridge";
import {
  polygonBridgeContractAddresses,
  polygonBridgeAbi,
} from "@/constants/PolygonBridge";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

const Main = () => {
  const [provider, setProvider] = useState();
  const [tokenUsdc, setTokenUsdc] = useState();
  const [tokenShark, setTokenShark] = useState();
  const [ethBridge, setEthBridge] = useState();
  const [bscBridge, setBscBridge] = useState();
  const [polygonBridge, setPolygonBridge] = useState();

  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const tokenUsdcAddress =
    chainId in tokenUsdcContractAddresses
      ? tokenUsdcContractAddresses[chainId]
      : null;
  const tokenSharkAddress =
    chainId in tokenSharkContractAddresses
      ? tokenSharkContractAddresses[chainId]
      : null;
  const ethBridgeAddress =
    chainId in ethBridgeContractAddresses
      ? ethBridgeContractAddresses[chainId]
      : null;
  const bscBridgeAddress =
    chainId in bscBridgeContractAddresses
      ? bscBridgeContractAddresses[chainId]
      : null;
  const polygonBridgeAddress =
    chainId in polygonBridgeContractAddresses
      ? polygonBridgeContractAddresses[chainId]
      : null;

  useEffect(() => {
    if (isWeb3Enabled) {
      const data = setup();

      Promise.all([data]).then((data) => {
        const providerCall = data[0].providerCall;
        const tokenUsdcCall = data[0].tokenUsdcCall;
        const tokenSharkCall = data[0].tokenSharkCall;
        const ethBridgeCall = data[0].ethBridgeCall;
        //const bscBridgeCall = data[0].bscBridgeCall;
        //const polygonBridgeCall = data[0].polygonBridgeCall;

        setProvider(providerCall);
        setTokenUsdc(tokenUsdcCall);
        setTokenShark(tokenSharkCall);
        setEthBridge(ethBridgeCall);
        setBscBridge(null);
        setPolygonBridge(null);
      });
    }
  }, [isWeb3Enabled, chainId]);

  async function setup() {
    const providerCall = new ethers.providers.Web3Provider(window.ethereum);

    const tokenUsdcCall = new ethers.Contract(
      tokenUsdcAddress,
      tokenUsdcAbi,
      providerCall
    );

    const tokenSharkCall = new ethers.Contract(
      tokenSharkAddress,
      tokenSharkAbi,
      providerCall.getSigner()
    );

    const ethBridgeCall = new ethers.Contract(
      ethBridgeAddress,
      ethBridgeAbi,
      providerCall.getSigner()
    );

    // const bscBridgeCall = new ethers.Contract(
    //   bscBridgeAddress,
    //   bscBridgeAbi,
    //   providerCall.getSigner()
    // );

    // const polygonBridgeCall = new ethers.Contract(
    //   polygonBridgeAddress,
    //   polygonBridgeAbi,
    //   providerCall.getSigner()
    // );

    return {
      providerCall,
      tokenUsdcCall,
      tokenSharkCall,
      ethBridgeCall,
      //bscBridgeCall,
      //polygonBridgeCall,
    };
  }

  async function submitHandler(e) {
    e.preventDefault();

    let sender = ethereum.selectedAddress;
    let fromBridge;

    let formData = new FormData(e.currentTarget);
    let receiver = formData.get("receiver");
    let amount = formData.get("amount");
    let toBridge = formData.get("toBridge");
    let token = formData.get("token");

    if (chainId === 31337) {
      fromBridge = ethBridge;
    } else if (chainId == 11155111) {
      fromBridge = ethers;
    }

    if (toBridge == "ethBridge") {
      toBridge = ethBridge;
    } else if (toBridge == "polygonBridge") {
      toBridge = polygonBridge;
    } else if (toBridge == "bscBridge") {
      toBridge = bscBridge;
    }

    if (token == "usdc") {
      token = tokenUsdc;
    } else if (token == "shark") {
      token = tokenShark;
    }

    await fromBridge.functions.setToken(token.address);
    await toBridge.functions.setToken(token.address);

    const admin = (await fromBridge.functions.getAdminAddress()).toString();

    let tx = await fromBridge.functions.burn(
      ethers.utils.parseUnits(amount, "ether")
    );

    handleSuccess(tx, sender, receiver, amount, fromBridge, toBridge);
  }

  async function handleSuccess(
    tx,
    sender,
    receiver,
    amount,
    fromBridge,
    toBridge
  ) {
    await tx.wait(1);
    await listenToEvent(sender, receiver, amount, fromBridge, toBridge);
    await tx.wait(1);
  }

  async function listenToEvent(sender, receiver, amount, fromBridge, toBridge) {
    const admin = (await toBridge.functions.getAdminAddress()).toString();
    const nonce = (await fromBridge.functions.getNonce()).toString();
    await fromBridge.once("Transfer", async () => {
      await toBridge.functions.mint(
        receiver,
        ethers.utils.parseUnits(amount, "ether"),
        ethers.BigNumber.from(nonce),
        fromBridge.address
      );
    });
  }

  return (
    <>
      <form onSubmit={submitHandler}>
        <div>
          Select to bridge:
          <select name="toBridge">
            <option value="ethBridge">Ethereum</option>
            <option value="polygonBridge">Polygon</option>
            <option value="bscBridge">Binace Smart Chain</option>
          </select>
        </div>

        <div>
          <select name="token">
            <option value="usdc">TokenUSDC</option>
            <option value="shark">Shark Token</option>
          </select>
        </div>

        <div>
          <label>Receiver</label>
          <input type="text" id="receiver" name="receiver" />
        </div>

        <div>
          <label>Amount</label>
          <input type="text" id="amount" name="amount" />
        </div>

        <button>Submit</button>
      </form>

      <button
        onClick={async function () {
          const sender = ethereum.selectedAddress;
          const nonce = Math.ceil(Math.random() * 100000);

          await ethBridge.functions.setToken(
            "0x228A79ebc5d1dD278bC0Df1b759D72BB1FB16950"
          );

          let tx = await ethBridge
            .functions.mint(
              sender,
              1,
              1,
              "0x697C4BD284F007781EE716BA2ae914ed4942b21a",
              { from: sender, gasLimit: 1 * 10 ** 6 }
            );

          await tx.wait(1);
        }}
      >
        Faucet
      </button>
    </>
  );
};

export default Main;
