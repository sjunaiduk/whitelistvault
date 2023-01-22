/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const EscrowTransactions = artifacts.require("EscrowTransactions");

module.exports = async function (callback) {
  const escrowTransactionsInstance = await EscrowTransactions.deployed();

  const accounts = await web3.eth.getAccounts();
  const presaleAddress = "0x0000000000000000000000000000000000000123";
  const seller = accounts[0];
  const buyersWalletToAdd = accounts[1];
  const price = "1000000000000000000"; // 1bnb

  await escrowTransactionsInstance.createSale(
    presaleAddress,
    buyersWalletToAdd,
    price,
    { from: seller }
  );

  const sales = await escrowTransactionsInstance.getSalesForSeller(seller);

  console.log(JSON.stringify(sales, null, 2));
};
