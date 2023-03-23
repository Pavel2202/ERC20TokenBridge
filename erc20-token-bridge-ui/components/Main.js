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
        console.log(data[0]);

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
    console.log("setup");

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

  async function listenToEvent(sender, receiver, amount) {
    const nonce = await ethBridge.functions.getNonce();
    console.log(nonce);

    await ethBridge.once("Transfer", async () => {
      console.log("mint");
      await maticBridge.functions.mint(
        sender,
        receiver,
        ethers.utils.parseUnits(amount, "ether"),
        Number(nonce)
      );
    });
  }

  async function handleSuccess(tx, sender, receiver, amount) {
    await tx.wait(1);
    await listenToEvent(sender, receiver, amount);
    await tx.wait(1);
    console.log("finished");
  }

  async function submitHandler(e) {
    e.preventDefault();

    let formData = new FormData(e.currentTarget);
    let sender = formData.get("sender");
    let receiver = formData.get("receiver");
    let amount = formData.get("amount");

    console.log(sender);
    console.log(receiver);
    console.log(amount);

    let tx = await ethBridge.functions.burn(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      sender,
      ethers.utils.parseUnits(amount, "ether")
    );

    handleSuccess(tx, sender, receiver, amount);
  }

  return (
    <form onSubmit={submitHandler}>
      <label>Sender</label>
      <input type="text" id="sender" name="sender" />
      <br />

      <label>Receiver</label>
      <input type="text" id="receiver" name="receiver" />
      <br />

      <label>Amount</label>
      <input type="text" id="amount" name="amount" />
      <br />

      <button>Submit</button>
    </form>
  );
};

export default Main;
