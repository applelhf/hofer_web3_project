import { ConnectButton } from "web3uikit";
import Link from "next/link";

export default function Header() {
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <h1 className="py-4 px-4 font-bold text-3xl">NFT MarketPlace</h1>
      <div className="flex flex-row items-center">
        <Link href="/">
          <h1 className="mr-4 p-6">Home</h1>
        </Link>
        <Link href="/sell-nft">
          <h1 className="mr-4 p-6">Sell NFT</h1>
        </Link>
        <ConnectButton moralisAuth={false} />
      </div>
    </nav>
  );
}
