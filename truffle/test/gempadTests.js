const GempadTests = artifacts.require("GempadTests");
contract("GempadTests", (accounts) => {
  it("should check if user WL or not for pinksale pre", async () => {
    const GempadTestsInstance = await GempadTests.deployed({
      from: accounts[0],
      overwrite: false,
    });

    let presale = "0xb73C10F7f306057f0E1B37607b164b2816A32a55";

    let whiteListedAddresses = await GempadTestsInstance.getWhitelistAddresses(
      presale
    );

    console.log(whiteListedAddresses);

    assert.equal(whiteListedAddresses !== null, true, "whitelist is null");
  });
  // it("should return pool details", async () => {
  //   const GempadTestsInstance = await GempadTests.deployed({
  //     from: accounts[0],
  //     overwrite: false,
  //   });

  //   let presale = "0xb73C10F7f306057f0E1B37607b164b2816A32a55";
  //   let pool = await GempadTestsInstance.getPoolDetails(presale);
  //   console.log(pool);
  //   assert.equal(pool !== null, true, "pool is null");
  // });
  // it("should return pool addresses", async () => {
  //   const GempadTestsInstance = await GempadTests.deployed({
  //     from: accounts[0],
  //     overwrite: false,
  //   });

  //   let pool = await GempadTestsInstance.getPoolAddresses();
  //   console.log(pool);
  //   assert.equal(pool !== null, true, "pool is null");
  // });
});
