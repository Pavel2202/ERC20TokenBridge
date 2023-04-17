import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <div>
      <h1>Decentralized Lottery</h1>
      <div>
        <ConnectButton moralisAuth={false} />
      </div>
    </div>
  );
};

export default Header;
