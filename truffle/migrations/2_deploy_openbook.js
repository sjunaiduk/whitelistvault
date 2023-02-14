const OpenBook = artifacts.require("OpenBook");

module.exports = async function (deployer) {
  await deployer.deploy(OpenBook);
};
