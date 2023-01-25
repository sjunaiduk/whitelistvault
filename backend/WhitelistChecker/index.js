const Web3 = require("web3");
// create web3 instance using BSC mainnet

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

// get the contract ABI
const abi = require("./pinksale/abi.json");

// get the contract address
const contractAddress = "0x447cE639254D38009377507E23D0D581A6Bff15E";

const user = `0x999999dB8a4aB0BC9Ad1d0dBcA5c77a8D28cc258`;

// create the contract instance
const contract = new web3.eth.Contract(abi, contractAddress);

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

web3.eth.getStorageAt(contractAddress, 24).then((r) => {
  //convert hex to decimal
  console.log(parseInt(r, 16));
});
