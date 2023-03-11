const Web3 = require("web3");
const web3 = new Web3("https://bsc-dataseed1.binance.org/");

const pinksaleAbi = require("./pinksaleAbi.json");

const pinksalePresale = "0x33CDAdd402d916CeE7Defc66Eb6196B0fA4a2899";

(async function testFunction() {
  const contract = new web3.eth.Contract(pinksaleAbi, pinksalePresale);
  const result = await contract.methods
    .isUserWhitelisted("0x358CFe35bf32367cB7Fe31e6C48E654E0e70f6c0")
    .call();
  console.log(result);
})();

/**
 * 0x8c9c938226E1f1F45bb395C288C980eea45D0dB1
 * Public, ended. State = 1
 *
 *
 *0x3be6c1f36e5628b0dac5416ed0010efa04f14b86
 Public, inprogress, state = 0


 Whitelist, inrpogreess, state = 0


 cant call poolStates on FL/ Subs.


 Whitelist only, incoming, state = 0

  Public, inprog , state = 0

0x9d54419a62097C736F3abf0e449D92eebB104092
Public, cancelled, state = 2

 */
