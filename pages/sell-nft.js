import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import NftMarketplaceContractAddress from "../constants/NftMarketplaceContractAddress.json";
import MintNftAddress from "../constants/BasicNftContractAddress.json";
import { Button, Form, useNotification } from "web3uikit";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import nftAbi from "../constants/BasicNftAbi.json";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";
import { data } from "autoprefixer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { chainId, account, isWeb3Enanled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;

  const marketplaceAddress = chainId
    ? NftMarketplaceContractAddress[chainString][0]
    : null;

  const mintNftAddress = chainId ? MintNftAddress[chainString][0] : null;

  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");

  const [mintedTokenId, setMintedTokenId] = useState("0");

  const { runContractFunction } = useWeb3Contract();

  const [mintingNFT = false, setMintingNFT] = useState();

  const [listingNFT = false, setListingNFT] = useState();
  
  async function mintNFT() {
    // if (!isWeb3Enanled || !chainId) {
    //   dispatch({
    //     type: "error",
    //     message: "not connect wallet",
    //     title: "error",
    //     position: "topR",
    //   });
    //   return;
    // }

    window.postMessage({ type: 'printTicket', data: "testing" });
    
  //  window.webkit.messageHandlers.printTicketHandler.postMessage("messageData");

    return

    console.log("mintingNFT...");

    setMintingNFT(true);

    const mintOptions = {
      abi: nftAbi,
      contractAddress: mintNftAddress,
      functionName: "mintNft",
      params: {},
    };

    await runContractFunction({
      params: mintOptions,
      onSuccess: (tx) => handleMintNftSuccess(tx),
      onError: (error) => {
        console.log(error);

        dispatch({
          type: "error",
          message: error.message,
          title: error.title,
          position: "topR",
        });

        setMintingNFT(false);
      },
    });
  }

  async function handleMintNftSuccess(tx) {
    //等待区块确认
    const mintTxReceipt = await tx.wait(1);

    //从mintNft抛出的event ： DogMinted（）获取tokenId
    const nft_token_Id = mintTxReceipt.events[0].args.tokenId.toString();

    console.log("handleMintNftSuccess......");

    console.log("tokenId=======", nft_token_Id);

    setMintedTokenId(nft_token_Id);

    setMintingNFT(false);
  }

  async function approveAndList(data) {
    // if (!isWeb3Enanled || !chainId) {
    //   dispatch({
    //     type: "error",
    //     message: "not connect wallet",
    //     title: "error",
    //     position: "topR",
    //   });
    //   return;
    // }

    console.log("approving...");

    setListingNFT(true);

    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseUnits(data.data[2].inputResult, "ether")
      .toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error);
        dispatch({
          type: "error",
          message: error.message,
          title: error.title,
          position: "topR",
        });
        setListingNFT(false);
      },
    });
  }
  async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
    console.log("handleApproveSuccess......");

    await tx.wait(1);

    console.log("start list item......");

    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: () => handleListSuccess(),
      onError: (error) => {
        console.log(error);
        setListingNFT(false);
      },
    });
  }

  async function handleListSuccess() {
    console.log("handleListSuccess success.....");

    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });

    setListingNFT(false);
  }

  async function handleWithdrawSuccess() {
    dispatch({
      type: "success",
      message: "withdrawing porceeds",
      title: "withdraw",
      position: "topR",
    });
  }

  async function setupUI() {
    const retrunedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (retrunedProceeds) {
      setProceeds(retrunedProceeds.toString());
    }
  }
  useEffect(() => {
    setupUI();
  }, [proceeds, account, isWeb3Enanled, chainId]);

  useEffect(() => {
    setupUI();
  }, [mintingNFT, listingNFT]);

  return (
    <div className={styles.container}>
      <div className="pl-10 pt-5 pb-5 border-b-2">
        <Button
          onClick={mintNFT}
          text="Mint NFT"
          theme="primary"
          loadingText=" loading"
          isLoading={mintingNFT}
        />
        {mintedTokenId != 0 ? (
          <div>MintedTokenId:{mintedTokenId}</div>
        ) : (
          <div></div>
        )}
      </div>
      <Form
        buttonConfig={{
          theme: "primary",
          isLoading: listingNFT,
          loadingText: " loading",
        }}
        onSubmit={approveAndList}
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "50%",
            value: "0x25D2FB4a936797Ed358555F3DC573CAe209D2A8b",
            key: "nftAddress",
            validation: {
              required: true,
            },
          },
          {
            name: "Token ID",
            type: "number",
            inputWidth: "50%",
            value: "",
            key: "tokenId",
            validation: {
              required: true,
            },
          },
          {
            name: "Price (Ether)",
            type: "number",
            inputWidth: "50%",
            value: "",
            key: "price",
            validation: {
              required: true,
            },
          },
        ]}
        title="Seller your NFT!"
        id="Main Form"
      ></Form>
      <div className="pl-5">
        Withdraw {ethers.utils.formatUnits(proceeds, "ether")} proceeds
      </div>
      {proceeds != "0" ? (
        <Button
          onClick={() => {
            runContractFunction({
              params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
              },
              onError: (error) => {
                console.log(error);
              },
              onSuccess: () => handleWithdrawSuccess,
            });
          }}
          text="withdraw"
          theme="primary"
        />
      ) : (
        <div className="pl-5">No Proceeds</div>
      )}
    </div>
  );
}
