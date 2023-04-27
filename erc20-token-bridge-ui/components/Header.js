import Link from "next/link";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <div className="p5 border-b-2 flex flex-row">
            <Link href="/" className="py-4 px-4 font-bold text-3xl">
              ERC20 Token Bridge
            </Link>
            <div className="ml-auto py-2 px-4">
              <Link href="/bridge" className="inline py-2 px-4 text-black-400">Bridge</Link>
              <ConnectButton moralisAuth={false} />
            </div>
          </div>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
