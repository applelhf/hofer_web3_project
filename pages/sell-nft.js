import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import NftMarketplaceContractAddress from "../constants/NftMarketplaceContractAddress.json";
import { Button, Form, useNotification } from "web3uikit";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import nftAbi from "../constants/BasicNftAbi.json";
import nftMarketplaceAbi from "../constants/NftMarketplaceAbi.json";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { chainId, account, isWeb3Enanled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : null;

  const marketplaceAddress = chainId
    ? NftMarketplaceContractAddress[chainString][0]
    : null;
  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");

  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data) {
    console.log("approving...");
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
      },
    });
  }
  async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
    console.log("handleApproveSuccess......");

    await tx.wait();

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
      },
    });
  }

  async function handleListSuccess() {
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
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

  return (
    <div className={styles.container}>
      <Form
        buttonConfig={{
          theme: "primary",
        }}
        onSubmit={approveAndList}
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "50%",
            value: "",
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
      <div>Withdraw {ethers.utils.formatUnits(proceeds, "ether")} proceeds</div>
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
        <div>No Proceeds</div>
      )}
    </div>
  );
}
