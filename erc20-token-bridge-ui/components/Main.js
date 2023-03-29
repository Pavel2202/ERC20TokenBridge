import { ethers } from "ethers";
import {
  ethBridgeContractAddresses,
  ethBridgeAbi,
} from "../constants/EthBridge";
import {
  maticBridgeContractAddresses,
  maticBridgeAbi,
} from "../constants/MaticBridge";
import {
  bscBridgeContractAddresses,
  bscBridgeAbi,
} from "../constants/BscBridge";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

const Main = () => {
  const [provider, setProvider] = useState();
  const [ethBridge, setEthBridge] = useState();
  const [maticBridge, setMaticBridge] = useState();
  const [bscBridge, setBscBridge] = useState();

  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const ethBridgeAddress =
    chainId in ethBridgeContractAddresses
      ? ethBridgeContractAddresses[chainId]
      : null;
  const maticBridgeAddress =
    chainId in maticBridgeContractAddresses
      ? maticBridgeContractAddresses[chainId]
      : null;
  const bscBridgeAddress =
    chainId in bscBridgeContractAddresses
      ? bscBridgeContractAddresses[chainId]
      : null;

  useEffect(() => {
    if (isWeb3Enabled) {
      const data = setup();

      Promise.all([data]).then((data) => {
        const providerCall = data[0].providerCall;
        const ethBridgeCall = data[0].ethBridgeCall;
        const maticBridgeCall = data[0].maticBridgeCall;
        const bscBridgeCall = data[0].bscBridgeCall;

        setProvider(providerCall);
        setEthBridge(ethBridgeCall);
        setMaticBridge(maticBridgeCall);
        setBscBridge(bscBridgeCall);
      });
    }
  }, [isWeb3Enabled]);

  async function setup() {
    const providerCall = await new ethers.providers.Web3Provider(
      window.ethereum
    );

    const ethBridgeCall = await new ethers.Contract(
      ethBridgeAddress,
      ethBridgeAbi,
      providerCall.getSigner()
    );

    const maticBridgeCall = await new ethers.Contract(
      maticBridgeAddress,
      maticBridgeAbi,
      providerCall.getSigner()
    );

    const bscBridgeCall = await new ethers.Contract(
      bscBridgeAddress,
      bscBridgeAbi,
      providerCall.getSigner()
    );

    return {
      providerCall,
      ethBridgeCall,
      maticBridgeCall,
      bscBridgeCall,
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

    if (chainId === 31337) {
      fromBridge = ethBridge;
    }

    if (toBridge == "ethBridge") {
      toBridge = ethBridge;
    } else if (toBridge == "maticBridge") {
      toBridge = maticBridge;
    } else if (toBridge == "bscBridge") {
      toBridge = bscBridge;
    }

    const admin = (await fromBridge.functions.getAdminAddress()).toString();

    let tx = await fromBridge.functions.burn(
      admin,
      sender,
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
        admin,
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
            <option value="maticBridge">Polygon</option>
            <option value="bscBridge">Binace Smart Chain</option>
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

          const admin = (
            await ethBridge.functions.getAdminAddress()
          ).toString();

          let tx = await ethBridge.functions.mint(
            admin,
            sender,
            ethers.utils.parseUnits("500", "ether"),
            ethers.BigNumber.from(nonce),
            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
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
