import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";
import NftMarketplaceContractAddress from "../constants/NftMarketplaceContractAddress.json";
import { useQuery } from "@apollo/client";
import NFTBox from "../components/NFTBox";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { chainId, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;
  const marketplaceAddress = chainId
    ? NftMarketplaceContractAddress[chainString][0]
    : null;

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

    function addiOSListener() {
    window.addEventListener("message", function (event) {
      if (event.data.type === "printTicket") {
        // Handle the message received from the web content
        let messageBody = event.data.data;
        console.log("Received message from web content:", messageBody);

        // Call the appropriate API or perform the necessary actions based on the message

        window.webkit.messageHandlers.printTicket.postMessage(messageData);
      }
    });
  }

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap gap-10">
        {isWeb3Enabled && chainId ? (
          loading || !listedNfts ? (
            <div>Loading....</div>
          ) : (
            listedNfts.activeItems.map((nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              return marketplaceAddress ? (
                <NFTBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                ></NFTBox>
              ) : (
                <div>change to goerli</div>
              );
            })
          )
        ) : (
          <div>web3 currently not enabled</div>
        )}
      </div>
    </div>
  );
}
