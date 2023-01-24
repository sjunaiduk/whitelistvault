const EscrowTransactionsV2 = artifacts.require("EscrowTransactionsV2");

module.exports = async function (deployer) {
  //await deployer.deploy(EscrowTransactions);
  await deployer.deploy(EscrowTransactionsV2);
};
