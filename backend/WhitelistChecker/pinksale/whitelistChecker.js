const Web3 = require("web3");
// create web3 instance using BSC mainnet
const express = require("express");
const router = express.Router();
const web3 = new Web3("http://127.0.0.1:9545/");

// get the contract ABI
const pinksaleAbi = require("./abi.json");
const escrowContractAbi = require("./escrowAbi.json");

// const user = `0x999999dB8a4aB0BC9Ad1d0dBcA5c77a8D28cc258`;

// // create the contract instance
// const contract = new web3.eth.Contract(abi, contractAddress);

// check if the address is whitelisted

// contract.methods
//   .isUserWhitelisted(user)
//   .call()
//   .then((result) => {
//     console.log(result);
//   });

// contract.methods
//   .getWhitelistedUsers(0, 99)
//   .call()
//   .then((result) => {
//     console.log(result);
//   });

//store11 is start time
// Stor12 is when it finishes
// stor16 is softcap
// stor17 is hardcap
// stor22 is cancelled/completed
// store24 is how much is raised
//https://bscscan.com/bytecode-decompiler?a=0xfb9e73f0fbea4a4d9f6ae4670183662f96ecd97e
// get the contract address
const contractAddress = "0x8e8348e512de279866de6620b8c75b2440c1be11";

const hasSaleCompleted = async () => {
  const result = await web3.eth.getStorageAt(contractAddress, 22);
  return result == 1;
};

const hasSaleStarted = async () => {
  const startTime = parseInt(
    await web3.eth.getStorageAt(contractAddress, 11),
    16
  );
  return startTime < Date.now();
};

const hasItBeenMoreThanNMinutesSinceSaleStarted = async (n) => {
  const startTime = parseInt(
    await web3.eth.getStorageAt(contractAddress, 11),
    16
  );
  return Date.now() > n * 60 * 1000 + startTime;
};

const isUserWhitelisted = async (user, contractAddress) => {
  const contract = new web3.eth.Contract(pinksaleAbi, contractAddress);
  return await contract.methods.isUserWhitelisted(user).call();
};

const ownerPvtKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;

// add owner account to web3
web3.eth.accounts.wallet.add(ownerPvtKey);

const deployedContractAddress = `0x8e8348e512de279866de6620b8c75b2440c1be11`;
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
      .estimateGas({ from: web3.eth.accounts.wallet[0].address });
    const tx = await contract.methods
      .completeSale(seller, presale, walletToAdd)
      .send({ from: web3.eth.accounts.wallet[0].address, gas: estimatedGas });

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
