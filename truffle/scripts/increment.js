/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const EscrowTransactions = artifacts.require("EscrowTransactions");
const EscrowTransactionsV2 = artifacts.require("EscrowTransactionsV2");

module.exports = async function (callback) {
  const escrowTransactionsInstance = await EscrowTransactions.new();

  const escrowTransactionsV2Instance = await EscrowTransactionsV2.new();

  const accounts = await web3.eth.getAccounts();
  const presaleAddress = "0x0000000000000000000000000000000000000123";
  const seller = accounts[0];
  const buyersWalletToAdd = accounts[1];
  const price = "1000000000000000000"; // 1bnb
  try {
    console.log(`Attempting to create sale with V1 contract...`);
    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );
  } catch (e) {
    console.log(`V1 - ${e.message}`);
  }

  const sales = await escrowTransactionsInstance.getSalesForSeller(seller);

  console.log("V1 - ", JSON.stringify(sales, null, 2));

  try {
    console.log(`Attempting to create sale with V2 contract...`);
    await escrowTransactionsV2Instance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );
  } catch (e) {
    console.log(`V2 - ${e.message}`);
  }

  const salesV2 = await escrowTransactionsV2Instance.getSalesForSeller(seller);

  console.log("V2 - ", JSON.stringify(salesV2, null, 2));
  try {
    const nonExistenceSale = await escrowTransactionsV2Instance.getSaleInfo(
      seller,
      seller,
      seller
    );

    console.log(
      "V2 non existent sale -  ",
      JSON.stringify(nonExistenceSale, null, 2)
    );
  } catch (e) {
    console.log(`V2 ERROR FETCHING NONEXISTENT SALE - ${e.message}`);
  }
};
