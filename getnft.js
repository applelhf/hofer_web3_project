const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const runApp = async () => {
  await Moralis.start({
    apiKey: "rA5ca7KPqZ5K4PyeH8d5fRJhOvSuO64APZmBOwZ9HEhSfyftPxAYyKz4nHvLUHX2",
    // ...and any other configuration
  });

  const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const chain = 31337;

  const response = await Moralis.EvmApi.nft.getWalletNFTCollections({
    address,
    chain,
  });

  console.log(response.toJSON());
};

runApp();
