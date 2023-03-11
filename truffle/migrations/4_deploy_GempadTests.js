const GempadTests = artifacts.require("GempadTests");

module.exports = async function (deployer) {
  await deployer.deploy(GempadTests);
};
