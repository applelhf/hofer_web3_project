import { useWeb3Contract, useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";
import nftAbi from "../constants/BasicNftAbi.json";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import Image from "next/image";
import UpdateListingModal from "./UpdateListingModal";
import { Card } from "web3uikit";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  const seperatorLength = separator.length;
  const charsToShow = strLen - seperatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: { tokenId: tokenId },
  });

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  });

  async function updateUI() {
    const tokenURI = await getTokenURI();

    console.log(`tokenURI is ${tokenURI}`);

    if (tokenURI) {
      const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      console.log("tokenURI is", tokenURI);

      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;

      const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      console.log("imageURIURL is", imageURIURL);

      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const isOwnerByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnerByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleCardClick = () => {
    isOwnerByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => {
            console.log(error);
            dispatch({
              message: error.message,
              title: error.title,
              position: "topR",
              type: "error",
            });
          },
          onSuccess: () => handleBuyItemSuccess(),
        });
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: "success",
      message: "item bought",
      title: "item bought",
      position: "topR",
    });
  };

  return (
    <div>
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
            ></UpdateListingModal>
            <Card
              title={tokenName}
              description={tokenDescription}
              onClick={handleCardClick}
            >
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">
                    Owned By {formattedSellerAddress}
                  </div>
                  <Image
                    loader={() => imageURI}
                    src={imageURI}
                    height="200"
                    width="200"
                  ></Image>
                  <div className="font-bold">
                    {ethers.utils.formatUnits(price, "ether")} ETH (Click To
                    Buy)
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div> Loading ......</div>
        )}
      </div>
    </div>
  );
}
