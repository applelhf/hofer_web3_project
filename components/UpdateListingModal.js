import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Input, Modal, useNotification } from "web3uikit";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const dispatch = useNotification();

  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

  const handleUpdateListingSuccess = () => {
    dispatch({
      type: "success",
      message: "listing updated",
      title: "listing updated = refresh (move blocks)",
      position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith(0);
  };

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0.01"),
    },
  });

  return (
    <Modal
      title="Update Price"
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => {
            console.log(error);
          },
          onSuccess: () => handleUpdateListingSuccess(),
        });
      }}
    >
      <div
        style={{
          padding: "20px 0 20px 0",
        }}
      >
        <Input
          label="update price"
          name="New Listing price"
          placeholder="0.01"
          type="number"
          onChange={(event) => {
            setPriceToUpdateListingWith(event.target.value);
          }}
        ></Input>
      </div>
    </Modal>
  );
}
