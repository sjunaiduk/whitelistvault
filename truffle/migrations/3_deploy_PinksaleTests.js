const PinksaleTests = artifacts.require("PinksaleTests");

module.exports = async function (deployer) {
  await deployer.deploy(PinksaleTests);
};
