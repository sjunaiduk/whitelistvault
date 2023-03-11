const PinkSaleTests = artifacts.require("PinkSaleTests");
let presale = `0x8c9c938226E1f1F45bb395C288C980eea45D0dB1`;
contract("PinkSaleTests", (accounts) => {
  // it("should get all whitelisted users", async () => {
  //   const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
  //     from: accounts[0],
  //     overwrite: false,
  //   });

  //   let allWhitelistedUsers =
  //     await pinkSaleTestContractInstance.getAllWhitelistedUsers(presale);

  //   console.log(`Number of whitelisted users: ${allWhitelistedUsers.length}`);
  //   console.log(
  //     `allWhitelistedUsers: ${JSON.parse(JSON.stringify(allWhitelistedUsers))}`
  //   );
  // });

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
  it("should return pool states", async () => {
    const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
      from: accounts[0],
      overwrite: false,
    });

    let pool = await pinkSaleTestContractInstance.getPoolStates(presale);
    console.log(pool);
    assert.equal(pool !== null, true, "pool is null");
  });
});
