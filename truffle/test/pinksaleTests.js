const PinkSaleTests = artifacts.require("PinkSaleTests");
let presale = `0xaca28b101152b3B33ED68849bE6e515e3cDfF8b5`;
contract("PinkSaleTests", (accounts) => {
  // it("should get all whitelisted users", async () => {
  //   const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
  //     from: accounts[0],
  //     overwrite: false,
  //   });

  //   let walletAdded = "0xABA74a68376e9Ac1030E50545C426757F4207b66";
  //   let walletNotAdded = accounts[4];

  //   let numberOfWhitelistedUsers =
  //     await pinkSaleTestContractInstance.numberOfWhitelistedUsers(presale);
  //   console.log(`numberOfWhitelistedUsers: ${numberOfWhitelistedUsers}`);

  //   let allWhitelistedUsers =
  //     await pinkSaleTestContractInstance.getWhitelistedUsers(
  //       presale,
  //       0,
  //       numberOfWhitelistedUsers
  //     );

  //   console.log(`allWhitelistedUsers: ${allWhitelistedUsers}`);

  //   // assert.equal(isAdded, true, "User is not added to whitelist");
  //   // assert.equal(isNotAdded, false, "User is added to whitelist");
  // });

  // it("should return x", async () => {
  //   const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
  //     from: accounts[0],
  //     overwrite: false,
  //   });

  //   let x = await pinkSaleTestContractInstance.isUserWhitelistedCustom(
  //     presale,
  //     accounts[3]
  //   );

  //   console.log(`User wl: ${x}`);

  //   assert.equal(x !== null, true, "x is null");
  // });
  it("should return pool setings", async () => {
    const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
      from: accounts[0],
      overwrite: false,
    });

    let pool = await pinkSaleTestContractInstance.getPoolSettings(presale);
    console.log(pool);
    assert.equal(pool !== null, true, "pool is null");
  });
});
