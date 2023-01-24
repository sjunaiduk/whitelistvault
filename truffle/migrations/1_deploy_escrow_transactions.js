const EscrowTransactions = artifacts.require("EscrowTransactionsV2");
const EscrowTransactionsV2 = artifacts.require("EscrowTransactions");

module.exports = async function (deployer) {
  //await deployer.deploy(EscrowTransactions);
  await deployer.deploy(EscrowTransactionsV2);
};
