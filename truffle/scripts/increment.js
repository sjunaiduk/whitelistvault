/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const EscrowTransactions = artifacts.require("EscrowTransactions");
const EscrowTransactionsV2 = artifacts.require("EscrowTransactionsV2");

module.exports = async function (callback) {
  const escrowTransactionsV2Instance = await EscrowTransactionsV2.new();

  const accounts = await web3.eth.getAccounts();
  const presaleAddress = "0x0000000000000000000000000000000000000123";
  const seller = accounts[0];
  const buyersWalletToAdd = accounts[1];
  const buyersWalletToAdd2 = accounts[2];
  const buyersWalletToAdd3 = accounts[3];
  const price = "1000000000000000000"; // 1bnb

  await escrowTransactionsV2Instance.createSale(
    presaleAddress,
    buyersWalletToAdd,
    price,
    { from: seller }
  );

  await escrowTransactionsV2Instance.createSale(
    presaleAddress,
    buyersWalletToAdd2,
    price,
    { from: seller }
  );

  await escrowTransactionsV2Instance.createSale(
    presaleAddress,
    buyersWalletToAdd3,
    price,
    { from: seller }
  );

  const sale = await escrowTransactionsV2Instance.getSaleInfo(
    seller,
    presaleAddress,
    buyersWalletToAdd
  );
  const sales = await escrowTransactionsV2Instance.getSalesForSeller(seller);

  console.log("sale", sale);

  console.log("sales", sales);
};
