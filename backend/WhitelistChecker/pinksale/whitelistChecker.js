const Web3 = require("web3");
// create web3 instance using BSC mainnet

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

// get the contract ABI
const abi = require("./abi.json");

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
  const contract = new web3.eth.Contract(abi, contractAddress);
  return await contract.methods.isUserWhitelisted(user).call();
};
async function main() {
  const result = await hasSaleCompleted();
  console.log(result);
  const result2 = await hasSaleStarted();
  console.log(result2);
  const result3 = await hasItBeenMoreThanNMinutesSinceSaleStarted(5);
  console.log(result3);

  const result4 = await isUserWhitelisted(
    "0xE64b19C7438a5F21bcaD5348E60E5A8D92754BDE",
    contractAddress
  );
  console.log(`is user whitelisted: ${result4}`);
}

main();
