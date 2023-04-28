import Link from "next/link";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <header className="navbar">
          <div className="p5 border-b-2 flex flex-row">
            <div>
              <Link href="/" className="py-4 px-4 font-bold text-3xl">
                ERC20 Token Bridge
              </Link>
            </div>
            <div className="ml-auto py-2 px-4">
              <Link href="/transfer" className="inline py-2 px-4 text-black-400">
                Transfer
              </Link>
              <Link href="/claim" className="inline py-2 px-4 text-black-400">
                Claim
              </Link>
              <ConnectButton moralisAuth={false} />
            </div>
          </div>
    </header>
  );
};

export default Header;
