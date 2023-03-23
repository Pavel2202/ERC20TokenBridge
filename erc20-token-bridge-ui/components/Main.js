import { ethers } from "ethers";
import {
  ethBridgeContractAddresses,
  ethBridgeAbi,
} from "../constants/EthBridge";
import {
  maticBridgeContractAddresses,
  maticBridgeAbi,
} from "../constants/MaticBridge";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

const Main = () => {
  const [provider, setProvider] = useState();
  const [ethBridge, setEthBridge] = useState();
  const [maticBridge, setMaticBridge] = useState();

  const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  const chainId = parseInt(chainIdHex);

  const ethBridgeAddress =
    chainId in ethBridgeContractAddresses
      ? ethBridgeContractAddresses[chainId]
      : null;
  const maticridgeAddress =
    chainId in maticBridgeContractAddresses
      ? maticBridgeContractAddresses[chainId]
      : null;

  useEffect(() => {
    if (isWeb3Enabled) {
      const data = setup();

      Promise.all([data]).then((data) => {
        const providerCall = data[0].providerCall;
        const ethBridgeCall = data[0].ethBridgeCall;
        const maticBridgeCall = data[0].maticBridgeCall;

        setProvider(providerCall);
        setEthBridge(ethBridgeCall);
        setMaticBridge(maticBridgeCall);
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
      maticridgeAddress,
      maticBridgeAbi,
      providerCall.getSigner()
    );

    return {
      providerCall,
      ethBridgeCall,
      maticBridgeCall,
    };
  }

  async function listenToEvent(sender, receiver, amount, fromBridge, toBridge) {
    const nonce = (await fromBridge.functions.getNonce()).toString();
    await fromBridge.once("Transfer", async () => {
      await toBridge.functions.mint(
        sender,
        receiver,
        ethers.utils.parseUnits(amount, "ether"),
        ethers.BigNumber.from(nonce)
      );
    });
  }

  async function handleSuccess(tx, sender, receiver, amount, fromBridge, toBridge) {
    await tx.wait(1);
    await listenToEvent(sender, receiver, amount, fromBridge, toBridge);
    await tx.wait(1);
  }

  async function submitHandler(e) {
    e.preventDefault();

    let formData = new FormData(e.currentTarget);
    let sender = formData.get("sender");
    let receiver = formData.get("receiver");
    let amount = formData.get("amount");
    let fromBridge = formData.get("fromBridge");
    let toBridge = formData.get("toBridge");

    if (fromBridge == "ethBridge") {
      fromBridge = ethBridge;
    } else {
      fromBridge = maticBridge;
    }

    if (toBridge == "ethBridge") {
      toBridge = ethBridge;
    } else {
      toBridge = maticBridge;
    }

    let tx = await fromBridge.functions.burn(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      sender,
      ethers.utils.parseUnits(amount, "ether")
    );

    handleSuccess(tx, sender, receiver, amount, fromBridge, toBridge);
  }

  return (
    <form onSubmit={submitHandler}>
      <div>
        Select from bridge:
        <select name="fromBridge">
          <option value="ethBridge">EthBridge</option>
          <option value="maticBridge">MaticBridge</option>
        </select>
      </div>

      <div>
        <label>Sender</label>
        <input type="text" id="sender" name="sender" />
      </div>

      <div>
        Select to bridge:
        <select name="toBridge">
          <option value="ethBridge">EthBridge</option>
          <option value="maticBridge">MaticBridge</option>
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
  );
};

export default Main;
