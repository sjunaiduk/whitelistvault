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

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

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

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

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

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

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

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

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

  it("should let a seller cancel a sale and make the sale again, then return the sales.", async () => {
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

    await escrowTransactionsInstance.cancelSale(
      presaleAddress,
      buyersWalletToAdd,
      {
        from: seller,
      }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    const sales = await escrowTransactionsInstance.getSalesForSeller(seller);

    assert.equal(
      sales.length,
      2,
      "There should be 2 total sales for that seller, one cancelled and one active."
    );
  });

  it("should not let a seller cancel a sale accepted buy a buyer, then attempt to complete it", async () => {
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

    const sellersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    try {
      await escrowTransactionsInstance.completeSale(
        seller,
        presaleAddress,
        buyersWalletToAdd
      );
    } catch (e) {
      assert.equal(
        e.reason,
        "No valid sale found. Must not be cancelled, wallet must not be added, buyer must have accepted sale and sent BNB to contract, and money must not have been sent to seller by contract."
      );
    }

    const sellersBalanceAfterSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    let buyersBalanceAfterCancellation = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

    const contractBalance = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(
      Math.round(sellersBalanceBeforeSale),
      Math.round(sellersBalanceAfterSale),
      "Seller was sent money when they shouldn't have been as the sale was cancelled."
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

  it("should not let a seller complete a sale after creating it without a buyer accepting it", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];

    const price = 1;

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );
    const buyersBalanceAfterSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );
    const sellersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    try {
      await escrowTransactionsInstance.completeSale(
        seller,
        presaleAddress,
        buyersWalletToAdd
      );
    } catch (e) {
      assert.equal(
        e.reason,
        "No valid sale found. Must not be cancelled, wallet must not be added, buyer must have accepted sale and sent BNB to contract, and money must not have been sent to seller by contract."
      );
    }

    const sellersBalanceAfterSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    let buyersBalanceAfterCancellation = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

    const contractBalance = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(
      Math.round(sellersBalanceBeforeSale),
      Math.round(sellersBalanceAfterSale),
      "Seller was sent money when they shouldn't have been as the sale was cancelled."
    );

    assert.equal(
      Math.round(buyersBalanceAfterSale),
      Math.round(buyersBalanceAfterCancellation),
      "Buyer should not have been sent anything."
    );

    assert.equal(
      contractBalance,
      0,
      "Contract balance still contains BNB and did not refund it to the buyer"
    );

    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      false,
      "Buyer did not accept and send BNB to the contract here the seller is completing a sale which hasn't been accepted by the buyer,"
    );

    assert.equal(
      sale.cancelled,
      false,
      "Seller didn't cancel he just created it and tried completing it without buyer verifiaction"
    );

    assert.equal(sale.walletAdded, false, "Wallet shouldn't be added here.");

    assert.equal(
      sale.moneySentToSellerByContract,
      false,
      "Money should not have been sent to seller by contract here"
    );
  });

  it("should let a seller make multiple sales, let the buyer accept them, and complete them", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const buyersWalletToAdd2 = accounts[2];
    const buyersWalletToAdd3 = accounts[3];
    const buyersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );
    const sellersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );
    const price = web3.utils.toWei("1", "ether");

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd2,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd3,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd,
      value: price,
    });
    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd2,
      value: price,
    });
    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd3,
      value: price,
    });

    await escrowTransactionsInstance.completeSale(
      seller,
      presaleAddress,
      buyersWalletToAdd2
    );
    await escrowTransactionsInstance.completeSale(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );
    await escrowTransactionsInstance.completeSale(
      seller,
      presaleAddress,
      buyersWalletToAdd3
    );

    const sellersBalanceAfterSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

    let sale2 = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd2
    );

    sale2 = sale2[0];
    let sale3 = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd3
    );

    sale3 = sale3[0];

    const contractBalance = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(
      contractBalance,
      0,
      "Contract balance still contains BNB and did not send it to the sellers"
    );

    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer did accept and send BNB to the contract here the seller is cancelling"
    );

    assert.equal(sale.cancelled, false, "Sale for some reason got cancelled");

    assert.equal(sale.walletAdded, true, "Wallet should be added here.");

    assert.equal(
      sale.moneySentToSellerByContract,
      true,
      "Money should be sent to the seller"
    );

    assert.equal(
      sale2.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer did accept and send BNB to the contract here the seller is cancelling"
    );

    assert.equal(sale2.cancelled, false, "Sale for some reason got cancelled");

    assert.equal(sale2.walletAdded, true, "Wallet should be added here.");

    assert.equal(
      sale2.moneySentToSellerByContract,
      true,
      "Money should be sent to the seller"
    );

    assert.equal(
      sale3.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer did accept and send BNB to the contract here the seller is cancelling"
    );

    assert.equal(sale3.cancelled, false, "Sale for some reason got cancelled");

    assert.equal(sale3.walletAdded, true, "Wallet should be added here.");

    assert.equal(
      sale3.moneySentToSellerByContract,
      true,
      "Money should be sent to the seller"
    );

    assert.equal(
      Math.round(sellersBalanceBeforeSale + 3),
      Math.round(sellersBalanceAfterSale),
      "Seller was sent money when they shouldn't have been as the sale was cancelled."
    );
  });
});
