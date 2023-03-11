const Web3 = require("web3");
// create web3 instance using BSC mainnet
const express = require("express");
const router = express.Router();
const web3 = new Web3("http://127.0.0.1:9545/");

const web3Bsc = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

const web3Arbitrum = new Web3(
  new Web3.providers.HttpProvider("https://arb1.arbitrum.io/rpc")
);

const web3Eth = new Web3(
  new Web3.providers.HttpProvider(
    "https://api.zmok.io/mainnet/oaen6dy8ff6hju9k"
  )
);

// get the contract ABI
const pinksaleAbi = require("./abi.json");
const escrowContractAbi = require("./escrowAbi.json");

const contractAddress = "0x8e8348e512de279866de6620b8c75b2440c1be11";

const hasSaleCompleted = async (ca) => {
  const result = await web3.eth.getStorageAt(ca, 22);
  return result == 1;
};

const hasSaleStarted = async (ca) => {
  const startTime = parseInt(await web3.eth.getStorageAt(ca, 11), 16);
  return startTime < Date.now();
};

const hasItBeenMoreThanNMinutesSinceSaleStarted = async (n, ca, network) => {
  let myWeb3;
  if (network == "bsc") {
    myWeb3 = web3Bsc;
  } else if (network == "arbitrum") {
    myWeb3 = web3Arbitrum;
  } else {
    myWeb3 = web3;
  }
  // for arb stor 12 is start time, everything incremented by 1.... check for ETH, polygon etc as well.
  const startTime = parseInt(await myWeb3.eth.getStorageAt(ca, 11), 16);
  console.log("startTime formatted into date", new Date(startTime * 1000));
  return Date.now() > n * 60 * 1000 + startTime;
};

const isUserWhitelisted = async (user, contractAddress) => {
  const contract = new web3.eth.Contract(pinksaleAbi, contractAddress);
  return await contract.methods.isUserWhitelisted(user).call();
};

let ownerPvtKey = `3faebe1172d112d19f28e0302bfc26f3b4bab9298720101dd73b80df8430baba`;

// add owner account to web3
web3.eth.accounts.wallet.add(ownerPvtKey);
console.log("Accounts ", web3.eth.accounts);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

router.post("/completeTest", async (req, res) => {
  const deployedAddress = req.body?.deployedAddress;
  const signature = req.body?.signature;
  const seller = req.body?.seller;
  const presale = req.body?.presale;
  const walletToAdd = req.body?.walletToAdd;

  // extract address from signature
  try {
    var signingAddress = await web3.eth.accounts.recover(
      "I'm the real owner",
      signature
    );
  } catch (e) {
    return res.status(400).json({
      seller: seller,
      signature: signature,
      message: "Error extracting address from signature",
      error: e.message,
    });
  }

  // validate address checksum
  try {
    const isValidAddress =
      web3.utils.toChecksumAddress(presale) &&
      web3.utils.toChecksumAddress(seller) &&
      web3.utils.toChecksumAddress(walletToAdd);

    if (!isValidAddress) {
      return res

        .json({
          "extracted address": signingAddress,
          seller: seller,
          signature: signature,
          message: "Invalid address checksum",
        })
        .status(400);
    }
  } catch (e) {
    return res.status(400).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Error checking address checksum",
    });
  }

  if (seller != signingAddress) {
    return res.status(400).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Seller and extracted address do NOT match",
    });
  }

  // complete sale. no pinksale checks since this is a test

  try {
    const contract = new web3.eth.Contract(escrowContractAbi, deployedAddress);

    const estimatedGas = await contract.methods
      .completeSale(seller, presale, walletToAdd)
      .estimateGas({
        from: web3.eth.accounts.wallet[0].address,
      });
    console.log(`estimated gas for complete sale: ${estimatedGas}`);
    const tx = await contract.methods
      .completeSale(seller, presale, walletToAdd)
      .send({
        from: web3.eth.accounts.wallet[0].address,
        gas: estimatedGas,
      });

    return res.status(200).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Sale completed",
      tx: tx,
    });
  } catch (e) {
    return res.status(400).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Error completing sale",
      error: e.message,
    });
  }
});

router.post("/cancelAsBuyer", async (req, res) => {
  const deployedAddress = req.body?.deployedAddress;
  const signature = req.body?.signature;
  const seller = req.body?.seller;
  const presale = req.body?.presale;
  const walletToAdd = req.body?.walletToAdd;

  // extract address from signature
  try {
    var signingAddress = await web3.eth.accounts.recover(
      "I'm the real owner",
      signature
    );
  } catch (e) {
    return res.status(400).json({
      seller: seller,
      signature: signature,
      message: "Error extracting address from signature",
      error: e.message,
    });
  }

  // validate address checksum
  try {
    const isValidAddress =
      web3.utils.toChecksumAddress(presale) &&
      web3.utils.toChecksumAddress(seller) &&
      web3.utils.toChecksumAddress(walletToAdd);

    if (!isValidAddress) {
      return res

        .json({
          "extracted address": signingAddress,
          seller: seller,
          signature: signature,
          message: "Invalid address checksum",
        })
        .status(400);
    }
  } catch (e) {
    return res.status(400).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Error checking address checksum",
    });
  }

  if (walletToAdd != signingAddress) {
    return res.status(400).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Buyer address and extracted address do NOT match",
    });
  }

  // complete sale. no pinksale checks since this is a test

  try {
    const contract = new web3.eth.Contract(escrowContractAbi, deployedAddress);

    const estimatedGas = await contract.methods
      .cancelSaleAsBuyer(presale, walletToAdd, seller)
      .estimateGas({ from: web3.eth.accounts.wallet[0].address });
    const tx = await contract.methods
      .cancelSaleAsBuyer(presale, walletToAdd, seller)
      .send({ from: web3.eth.accounts.wallet[0].address, gas: estimatedGas });

    return res.status(200).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Sale cancelled",
      tx: tx,
    });
  } catch (e) {
    return res.status(400).json({
      "extracted address": signingAddress,
      seller: seller,
      signature: signature,
      message: "Error cancelling sale",
      error: e.message,
    });
  }
});

module.exports = router;

hasItBeenMoreThanNMinutesSinceSaleStarted(
  1,
  "0x0AAf62d60154C72522CD0f5e4eAE3626c51DE2aE",
  "arbitrum"
);
