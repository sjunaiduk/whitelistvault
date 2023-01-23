const EscrowTransactionsV2 = artifacts.require("EscrowTransactionsV2");

contract("EscrowTransactionsV2", (accounts) => {
  it("should create a new escrow transactions with correct values", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const price = "1000000000000000000";

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    const sale = await debug(
      escrowTransactionsInstance.getSaleInfo(
        seller,
        presaleAddress,
        buyersWalletToAdd
      )
    );

    /*struct SaleInfo {
        bool buyerAcceptedSaleAndSentBnbToContract;
        bool cancelled;
        bool walletAdded;
        string presalePlatform;
        bool moneySentToSellerByContract;
        uint256 price;
    } */
    assert.equal(sale.price, price, "Sale price is not correct");
    assert.equal(
      sale.presalePlatform,
      "Pink",
      "Presale platform is not correct"
    );
    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      false,
      "Buyer has not accepted sale and sent BNB to contract"
    );
    assert.equal(sale.cancelled, false, "Sale hasn't been cancelled");
    assert.equal(sale.walletAdded, false, "Wallet has not been added");
    assert.equal(
      sale.moneySentToSellerByContract,
      false,
      "Money has not been sent to seller by contract"
    );
  });

  it("should let a buyer accept a sale, set the correct values and transfer BNB from the buyer to the contract", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const price = "1000000000000000000"; // 1bnb

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd,
      value: price,
    });

    const sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    const contractBalance = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(contractBalance, price, "Contract balance is not correct");

    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer has not accepted sale and sent BNB to contract"
    );

    assert.equal(sale.cancelled, false, "Sale hasn't been cancelled");

    assert.equal(sale.walletAdded, false, "Wallet has not been added");

    assert.equal(
      sale.moneySentToSellerByContract,
      false,
      "Money has not been sent to seller by contract"
    );

    escrowTransactionsInstance.withdraw({ from: seller });
  });

  it("should let a seller complete sale (I will do that), and transfer correct BNB from contract and send to the seller", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const price = "1000000000000000000"; // 1bnb

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd,
      value: price,
    });

    const result = await escrowTransactionsInstance.completeSale(
      seller,
      presaleAddress,
      buyersWalletToAdd,
      {
        from: seller,
      }
    );

    const sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    const contractBalance = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(contractBalance, 0, "Contract balance is not correct");

    assert.notEqual(
      contractBalance,
      price,
      "The contract hasn't sent BNB to the seller after completion"
    );

    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer has not accepted sale and sent BNB to contract"
    );

    assert.equal(sale.cancelled, false, "Sale hasn't been cancelled");

    assert.equal(sale.walletAdded, true, "Wallet has not been added");

    assert.equal(
      sale.moneySentToSellerByContract,
      true,
      "Money has not been sent to seller by contract"
    );
  });

  it("should let a seller cancel a sale, and transfer correct BNB from contract and send to the buyer", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const buyersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );
    const price = 1;

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd,
      value: price,
    });

    await escrowTransactionsInstance.cancelSale(
      presaleAddress,
      buyersWalletToAdd,
      {
        from: seller,
      }
    );

    let buyersBalanceAfterCancellation = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );

    const sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    const contractBalance = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(
      Math.round(buyersBalanceBeforeSale),
      Math.round(buyersBalanceAfterCancellation),
      "Buyer wasn't refunded."
    );

    assert.equal(
      contractBalance,
      0,
      "Contract balance still contains BNB and did not refund it to the buyer"
    );

    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer did accept and send BNB to the contract here the seller is cancelling"
    );

    assert.equal(sale.cancelled, true, "Sale for some reason wasnt cancelled!");

    assert.equal(sale.walletAdded, false, "Wallet shouldn't be added here.");

    assert.equal(
      sale.moneySentToSellerByContract,
      false,
      "Money should not have been sent to seller by contract here"
    );
  });

  it("should return the sales for a seller", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const price = "1000000000000000000"; // 1bnb

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    const sales = await escrowTransactionsInstance.getSalesForSeller(seller);

    assert.equal(sales.length, 1, "There should be 1 sale for the seller");
  });
});
