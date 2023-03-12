const OpenBookV2 = artifacts.require("OpenBookV2");

module.exports = async function (deployer) {
  await deployer.deploy(OpenBookV2);
};
