const Web3 = require("web3");
// create web3 instance using BSC mainnet

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

// get the contract ABI
const abi = require("./pinksale/abi.json");

// get the contract address
const contractAddress = "0x4Fb131079b021Ad52D792a95e9E9465AcB160d70";

const user = `0x744365e7c03074e5dA11FC57C8b649bc5E6161a1`;

// create the contract instance
const contract = new web3.eth.Contract(abi, contractAddress);

// check if the address is whitelisted

contract.methods
  .isUserWhitelisted(user)
  .call()
  .then((result) => {
    console.log(result);
  });

const rawCall = contract.methods.getWhitelistedUsers(0, 9).encodeABI();

console.log(rawCall);

contract.methods
  .getWhitelistedUsers(0, 9)
  .call()
  .then((result) => {
    console.log(result);
  });

//store11 is start time
// Stor12 is when it finishes
// stor16 is softcap
// stor17 is hardcap
// stor22 is cancelled/completed
// store24 is how much is raised
// stor 38 are stored addressed array
//https://bscscan.com/bytecode-decompiler?a=0xfb9e73f0fbea4a4d9f6ae4670183662f96ecd97e

var key = "0x09B1Fea04fBed7FfFAbFc108fD5040808300eA61";
var slot = 39;

// get length of array
web3.eth.getStorageAt(contractAddress, 38).then((r) => {
  //convert hex to decimal
  console.log(parseInt(r, 16));
});

/// get the value at the index

async function manualWhitelistCheck() {
  const length = parseInt(await web3.eth.getStorageAt(contractAddress, 38), 16);
  console.log(length);
  let index = 0;
  var compositeKey = web3.utils.soliditySha3({
    type: "uint256",
    value: 38,
  });

  for (let i = 0; i < length; i++) {
    const address = await web3.eth.getStorageAt(contractAddress, compositeKey);
    console.log(address);
    compositeKey = new web3.utils.BN(compositeKey).add(new web3.utils.BN(1));
  }
}

//manualWhitelistCheck();

// start time

web3.eth.getStorageAt(contractAddress, 11).then((r) => {
  //convert hex to decimal
  //convert to date

  var date = new Date(parseInt(r, 16) * 1000);
  console.log(date);
});

// doesnt work.........

// var compositeKey = web3.utils.soliditySha3({
//   type: "uint256",
//   value: 39,
// });

// console.log(compositeKey);

// web3.eth.getStorageAt(contractAddress, compositeKey).then(console.log);
