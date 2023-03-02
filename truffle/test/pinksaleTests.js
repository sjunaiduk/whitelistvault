const PinkSaleTests = artifacts.require("PinkSaleTests");
contract("PinkSaleTests", (accounts) => {
  it("should check if user WL or not for pinksale pre", async () => {
    const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
      from: accounts[0],
      overwrite: false,
    });

    let presale = "0x947E44100221f75ea8E3558F89F93FC76E8D70a8";
    let walletAdded = "0x56E2Af8bf1C733064BA8F9Be9675e69B1e376241";
    let walletNotAdded = accounts[1];

    let isAdded = await pinkSaleTestContractInstance.isUserWhitelisted(
      walletAdded,
      presale
    );

    let isNotAdded = await pinkSaleTestContractInstance.isUserWhitelisted(
      walletNotAdded,
      presale
    );

    assert.equal(isAdded, true, "User is not added to whitelist");
    assert.equal(isNotAdded, false, "User is added to whitelist");
  });

  it("should return x", async () => {
    const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
      from: accounts[0],
      overwrite: false,
    });

    let presale = "0x947E44100221f75ea8E3558F89F93FC76E8D70a8";
    let x = await pinkSaleTestContractInstance.numberOfWhitelistedUsers(
      presale
    );

    console.log(x);

    assert.equal(x !== null, true, "x is null");
  });
  it("should return pool setings", async () => {
    const pinkSaleTestContractInstance = await PinkSaleTests.deployed({
      from: accounts[0],
      overwrite: false,
    });

    let presale = "0x947E44100221f75ea8E3558F89F93FC76E8D70a8";
    let pool = await pinkSaleTestContractInstance.getPoolSettings(presale);
    console.log(pool);
    assert.equal(pool !== null, true, "pool is null");
  });
});
