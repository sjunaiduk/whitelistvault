import React, { useState } from "react";
import { useEth } from "../contexts/EthContext";
let BigInt = require("big-integer");
const artifact = require("../contracts/EscrowTransactionsV2.json");
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

export const ViewSales = ({ sellerAddress }) => {
  const { state } = useEth();

  const [sales, setSales] = useState(null);

  const getSales = async () => {
    const { abi } = artifact;

    const contract = new web3.eth.Contract(
      abi,
      "0xD98557ae993cb1054Add68FF2a77A7CB2Bc9Bf87"
    );

    console.log(`Fetching sales for ${sellerAddress}...`);
    console.log(state.contract);
    const saleData = await contract.methods
      .getSaleInfo(
        "0x00aB82a10913756ce790b6139BE6151cD9f4420D",
        "0x0000000000000000000000000000000000000123",
        "0x0000000000000000000000000000000000000123"
      )
      .call();
    console.log("saleData", saleData);
  };
  return (
    <div>
      <h1>Sales:</h1>
      {state.accounts?.length ? (
        <>
          <button onClick={getSales}>Get Sales</button>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
};
