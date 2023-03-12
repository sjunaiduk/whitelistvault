const { time } = require("openzeppelin-test-helpers");

const EscrowTransactionsV2 = artifacts.require("OpenBookV2");

contract("OpenBook", (accounts) => {
  const presaleAddress = "0xa49E4960aEDBfd467f48531B392148fDee08E582";
  let escrowTransactionsInstance;
  beforeEach(async () => {
    escrowTransactionsInstance = await EscrowTransactionsV2.at(
      "0x4F11826189cbC8057F3649fd568969939F827fd7"
    );
  });
  it("should create 3 open book transactions and let a buyer accept one, so there will be only 2 open book transactions for that seller", async () => {
    console.log(`Deployed CA: ${escrowTransactionsInstance.address}`);
    const seller = accounts[0];
    const buyer = accounts[1];
    const noAddress = "0x0000000000000000000000000000000000000000";
    const price = "1000000";

    x = await escrowTransactionsInstance.createSale(
      presaleAddress,
      noAddress,
      price,
      { from: seller }
    );

    console.log(`Gas used for create sale: ${x.receipt.gasUsed}`);
    await escrowTransactionsInstance.createSale(
      presaleAddress,
      noAddress,
      price,
      { from: seller }
    );
    await escrowTransactionsInstance.createSale(
      presaleAddress,
      noAddress,
      price,
      { from: seller }
    );

    // let buyer accept one

    const buyerAcceptResult =
      await escrowTransactionsInstance.acceptSaleAsBuyer(
        seller,
        presaleAddress,
        price,
        {
          from: buyer,
          value: price,
        }
      );

    console.log(
      `Gas used for buyer accept sale: ${buyerAcceptResult.receipt.gasUsed}`
    );

    let openBookSales =
      await escrowTransactionsInstance.getPendingOpenBookSales();

    console.log(openBookSales);
    /*struct SaleInfo {
        bool buyerAcceptedSaleAndSentBnbToContract;
        bool cancelled;
        bool walletAdded;
        string presalePlatform;
        bool moneySentToSellerByContract;
        uint256 price;
    } */
    const sale = openBookSales[0];
    assert.equal(openBookSales.length, 2, "There should be 2 open book sales");
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

  // 3 sales created by account 0 so far.

  it("should return the sales for a seller", async () => {
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[2];
    const price = "1000000000000000000"; // 1bnb

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    const sales = await escrowTransactionsInstance.getSalesForSeller(seller);

    assert.equal(sales.length, 4, "There should be 4 sales for the seller");
  });

  // There are 4 sales created by account 0 so far.
  it("should let a seller cancel a sale and make the sale again, then return the sales.", async () => {
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[3];
    const price = "10000000000000"; // 1bnb

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.cancelSale(
      presaleAddress,
      buyersWalletToAdd,
      seller,
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
      6,
      "There should be 6 total sales for that seller, 1 cancelled and 5 active."
    );

    assert.equal(
      sales[4].cancelled,
      true,
      "The first sale should be cancelled"
    );

    assert.equal(
      sales[5].cancelled,
      false,
      "The second sale should not be cancelled"
    );
  });

  // 6 total sales created by account 0 so far.
  // 1 cancelled, 5 active.

  it("should not let a seller cancel a sale accepted buy a buyer, then attempt to complete it", async () => {
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[4];

    const price = "10000000";

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    const contractBalanceBeforeSaleWasAccepted = Number(
      web3.utils.fromWei(
        await web3.eth.getBalance(escrowTransactionsInstance.address),
        "ether"
      )
    );

    const buyersBalanceBeforeSaleWasAccepted = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );

    const sellersBalanceBeforeSaleWasAccepted = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller,
      presaleAddress,
      price,
      {
        from: buyersWalletToAdd,
        value: price,
      }
    );

    const contractBalanceAfterSaleWasAccepted = Number(
      web3.utils.fromWei(
        await web3.eth.getBalance(escrowTransactionsInstance.address),
        "ether"
      )
    );

    const sellersBalanceAfterSaleWasAccepted = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    await escrowTransactionsInstance.cancelSale(
      presaleAddress,
      buyersWalletToAdd,
      seller,
      {
        from: seller,
      }
    );

    let buyersBalanceAfterSaleWasCancelled = Number(
      web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
    );
    const contractBalanceAfterSaleWasCancelled = Number(
      web3.utils.fromWei(
        await web3.eth.getBalance(escrowTransactionsInstance.address),
        "ether"
      )
    );

    try {
      await escrowTransactionsInstance.completeSale(
        seller,
        presaleAddress,
        buyersWalletToAdd,
        {
          from: seller,
        }
      );
    } catch (e) {}

    const sellersBalanceAfterSaleFailedToComplete = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

    assert.equal(
      Math.round(sellersBalanceBeforeSaleWasAccepted),
      Math.round(sellersBalanceAfterSaleWasAccepted),
      "Seller was sent money when the buyer accepted the sale."
    );

    assert.equal(
      Math.round(sellersBalanceAfterSaleWasAccepted),
      Math.round(sellersBalanceAfterSaleFailedToComplete),
      "Seller was sent money when the seller falsely tried to complete the sale."
    );

    assert.equal(
      Math.round(buyersBalanceBeforeSaleWasAccepted),
      Math.round(buyersBalanceAfterSaleWasCancelled),
      "Buyer wasn't refunded."
    );

    assert.equal(
      contractBalanceBeforeSaleWasAccepted,
      contractBalanceAfterSaleWasCancelled,
      "Contract balance still contains BNB and did not refund it to the buyer"
    );

    assert.equal(
      contractBalanceAfterSaleWasAccepted >
        contractBalanceBeforeSaleWasAccepted,
      true,
      "Contract balance did not receive BNB from the buyer after it was accepted"
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
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[5];

    const price = 100000000;

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
        buyersWalletToAdd,
        {
          from: seller,
        }
      );
    } catch (e) {}

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
  // account [1] has accepted the sale and sent BNB to the contract
  // sale exists for account [2] and [3] need them to accept...
  // it("should let a seller make multiple sales, let the buyer accept them, and complete them", async () => {
  //   const escrowTransactionsInstance = await EscrowTransactionsV2.new();
  //   const presaleAddress = "0x0000000000000000000000000000000000000123";
  //   const seller = accounts[0];
  //   const buyersWalletToAdd2 = accounts[2];
  //   const buyersWalletToAdd3 = accounts[3];
  //   const buyersBalanceBeforeSale = Number(
  //     web3.utils.fromWei(await web3.eth.getBalance(buyersWalletToAdd), "ether")
  //   );
  //   const sellersBalanceBeforeSale = Number(
  //     web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
  //   );
  //   const price = web3.utils.toWei("0.001", "ether");

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd2,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd3,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
  //     from: buyersWalletToAdd,
  //     value: price,
  //   });
  //   await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
  //     from: buyersWalletToAdd2,
  //     value: price,
  //   });
  //   await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
  //     from: buyersWalletToAdd3,
  //     value: price,
  //   });

  //   const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
  //   const signature = await web3.eth.accounts.sign(
  //     "I'm the real owner",
  //     sellersPrivateKey
  //   );

  //   try {
  //     const response = await axios.post(url, {
  //       signature: signature.signature,
  //       seller: seller,
  //       presale: presaleAddress,
  //       walletToAdd: buyersWalletToAdd,
  //       deployedAddress: escrowTransactionsInstance.address,
  //     });
  //   } catch (e) {}

  //   try {
  //     const response = await axios.post(url, {
  //       signature: signature.signature,
  //       seller: seller,
  //       presale: presaleAddress,
  //       walletToAdd: buyersWalletToAdd2,
  //       deployedAddress: escrowTransactionsInstance.address,
  //     });
  //   } catch (e) {}

  //   try {
  //     const response = await axios.post(url, {
  //       signature: signature.signature,
  //       seller: seller,
  //       presale: presaleAddress,
  //       walletToAdd: buyersWalletToAdd3,
  //       deployedAddress: escrowTransactionsInstance.address,
  //     });
  //   } catch (e) {}

  //   const sellersBalanceAfterSale = Number(
  //     web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
  //   );

  //   let sale = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress,
  //     buyersWalletToAdd
  //   );

  //   sale = sale[0];

  //   let sale2 = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress,
  //     buyersWalletToAdd2
  //   );

  //   sale2 = sale2[0];
  //   let sale3 = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress,
  //     buyersWalletToAdd3
  //   );

  //   sale3 = sale3[0];

  //   const contractBalance = await web3.eth.getBalance(
  //     escrowTransactionsInstance.address
  //   );

  //   assert.equal(
  //     contractBalance,
  //     0,
  //     "Contract balance still contains BNB and did not send it to the sellers"
  //   );

  //   assert.equal(
  //     sale.buyerAcceptedSaleAndSentBnbToContract,
  //     true,
  //     "Buyer did accept and send BNB to the contract here the seller is cancelling"
  //   );

  //   assert.equal(sale.cancelled, false, "Sale for some reason got cancelled");

  //   assert.equal(sale.walletAdded, true, "Wallet should be added here.");

  //   assert.equal(
  //     sale.moneySentToSellerByContract,
  //     true,
  //     "Money should be sent to the seller"
  //   );

  //   assert.equal(
  //     sale2.buyerAcceptedSaleAndSentBnbToContract,
  //     true,
  //     "Buyer did accept and send BNB to the contract here the seller is cancelling"
  //   );

  //   assert.equal(sale2.cancelled, false, "Sale for some reason got cancelled");

  //   assert.equal(sale2.walletAdded, true, "Wallet should be added here.");

  //   assert.equal(
  //     sale2.moneySentToSellerByContract,
  //     true,
  //     "Money should be sent to the seller"
  //   );

  //   assert.equal(
  //     sale3.buyerAcceptedSaleAndSentBnbToContract,
  //     true,
  //     "Buyer did accept and send BNB to the contract here the seller is cancelling"
  //   );

  //   assert.equal(sale3.cancelled, false, "Sale for some reason got cancelled");

  //   assert.equal(sale3.walletAdded, true, "Wallet should be added here.");

  //   assert.equal(
  //     sale3.moneySentToSellerByContract,
  //     true,
  //     "Money should be sent to the seller"
  //   );

  //   assert.equal(
  //     Math.round(sellersBalanceBeforeSale + 3),
  //     Math.round(sellersBalanceAfterSale),
  //     "Seller was sent money when they shouldn't have been as the sale was cancelled."
  //   );
  // });

  // it("should let a buyer be part of multiple sales, and return the sales that buyer is part of", async () => {
  //   const escrowTransactionsInstance = await EscrowTransactionsV2.new();
  //   const presaleAddress = "0x0000000000000000000000000000000000000123";
  //   const seller = accounts[0];
  //   const seller2 = accounts[4];
  //   const buyersWalletToAdd = accounts[1];
  //   const presaleAddress2 = accounts[2];
  //   const presaleAddress3 = accounts[3];

  //   const price = web3.utils.toWei("1", "ether");

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress2,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress3,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress3,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller2 }
  //   );

  //   const salesForBuyer = await escrowTransactionsInstance.getSalesForBuyer(
  //     buyersWalletToAdd
  //   );

  //   //console.log(salesForBuyer);

  //   assert.equal(
  //     salesForBuyer.length,
  //     4,
  //     "There should be 4 sales for this buyer"
  //   );
  // });

  // account [1] has accepted a sale.
  // it("should let a buyer be part of multiple sales, and return the sales that buyer is part of, the number of pending, active and completed sales should be correct", async () => {
  //   const escrowTransactionsInstance = await EscrowTransactionsV2.new();
  //   const presaleAddress = "0x0000000000000000000000000000000000000123";
  //   const seller = accounts[0];
  //   const seller2 = accounts[4];
  //   const buyersWalletToAdd = accounts[1];
  //   const presaleAddress2 = accounts[2];
  //   const presaleAddress3 = accounts[3];

  //   const price = web3.utils.toWei("1", "ether");

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress2,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress3,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress3,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller2 }
  //   );

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(
  //     seller2,
  //     presaleAddress3,
  //     {
  //       from: buyersWalletToAdd,
  //       value: price,
  //     }
  //   );

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(
  //     seller,
  //     presaleAddress3,
  //     {
  //       from: buyersWalletToAdd,
  //       value: price,
  //     }
  //   );

  //   const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
  //   const signature = await web3.eth.accounts.sign(
  //     "I'm the real owner",
  //     sellersPrivateKey
  //   );

  //   try {
  //     const response = await axios.post(url, {
  //       signature: signature.signature,
  //       seller: seller,
  //       presale: presaleAddress3,
  //       walletToAdd: buyersWalletToAdd,
  //       deployedAddress: escrowTransactionsInstance.address,
  //     });
  //   } catch (e) {}

  //   // 4 Total sales
  //   // 2 has been accepted
  //   // 1 Has been completed
  //   // 2 are pending

  //   const salesForBuyer = await escrowTransactionsInstance.getSalesForBuyer(
  //     buyersWalletToAdd
  //   );

  //   const pendingSales = salesForBuyer.filter((sale) => {
  //     return sale.buyerAcceptedSaleAndSentBnbToContract === false;
  //   });

  //   const acceptedSales = salesForBuyer.filter((sale) => {
  //     return sale.buyerAcceptedSaleAndSentBnbToContract === true;
  //   });

  //   const completedSales = salesForBuyer.filter((sale) => {
  //     return sale.moneySentToSellerByContract === true;
  //   });

  //   //console.log(salesForBuyer);

  //   assert.equal(
  //     salesForBuyer.length,
  //     4,
  //     "There should be 4 sales for this buyer"
  //   );

  //   assert.equal(
  //     pendingSales.length,
  //     2,
  //     "There should be 2 pending sales for this buyer"
  //   );

  //   assert.equal(
  //     acceptedSales.length,
  //     2,
  //     "There should be 2 accepted sales for this buyer"
  //   );

  //   assert.equal(
  //     completedSales.length,
  //     1,
  //     "There should be 1 completed sales for this buyer"
  //   );
  // });

  // it("should not let a buyer accept and cancel within 5 minutes but allow after.", async () => {
  //   const escrowTransactionsInstance = await EscrowTransactionsV2.new();
  //   const presaleAddress = "0x0000000000000000000000000000000000000123";
  //   const presaleAddress2 = "0x0000000000000000000000000000000000000124";
  //   const seller = accounts[0];
  //   const buyersWalletToAdd = accounts[1];

  //   const price = web3.utils.toWei("1", "ether");

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress2,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
  //     from: buyersWalletToAdd,
  //     value: price,
  //   });

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(
  //     seller,
  //     presaleAddress2,
  //     {
  //       from: buyersWalletToAdd,
  //       value: price,
  //     }
  //   );
  //   const buyersBalanceBeforeValidCancellation = await web3.eth.getBalance(
  //     buyersWalletToAdd
  //   );

  //   // try cancelling a sale right after
  //   await escrowTransactionsInstance.cancelSale(
  //     presaleAddress2,
  //     buyersWalletToAdd,
  //     seller,
  //     {
  //       from: buyersWalletToAdd,
  //     }
  //   );
  //   const buyersBalanceAfterValidCancellation = await web3.eth.getBalance(
  //     buyersWalletToAdd
  //   );

  //   // wait 5 minutes
  //   await time.increase(time.duration.minutes(5));

  //   try {
  //     await escrowTransactionsInstance.cancelSale(
  //       presaleAddress,
  //       buyersWalletToAdd,
  //       seller,
  //       {
  //         from: buyersWalletToAdd,
  //       }
  //     );
  //   } catch (e) {
  //     assert.equal(
  //       e.reason,
  //       "You can't cancel a sale after 5 minutes of accepting it (as a buyer)"
  //     );
  //   }

  //   // should not be cancelled
  //   const saleInfo = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress,
  //     buyersWalletToAdd
  //   );

  //   // should be cancelled
  //   const saleInfo2 = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress2,
  //     buyersWalletToAdd
  //   );

  //   assert.equal(
  //     saleInfo[0].cancelled,
  //     false,
  //     "The first sale should not be cancelled since buyer cancelled within 5 minutes of accepting"
  //   );

  //   assert.equal(
  //     saleInfo2[0].cancelled,
  //     true,
  //     "The second sale should be cancelled since buyer cancelled after 5 minutes of accepting"
  //   );
  //   assert(
  //     buyersBalanceAfterValidCancellation >
  //       buyersBalanceBeforeValidCancellation,
  //     "Buyers balance should be higher after valid cancellation"
  //   );
  //   //
  // });

  // it("should not let a buyer try to cancel someone elses sale", async () => {
  //   const escrowTransactionsInstance = await EscrowTransactionsV2.new();
  //   const presaleAddress = "0x0000000000000000000000000000000000000123";
  //   const seller = accounts[0];
  //   const buyersWalletToAdd = accounts[1];
  //   const badBuyer = accounts[2];

  //   const price = web3.utils.toWei("1", "ether");

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
  //     from: buyersWalletToAdd,
  //     value: price,
  //   });

  //   // wait 5 minutes
  //   await time.increase(time.duration.minutes(5));

  //   // try cancelling a sale after 5 minutes
  //   try {
  //     await escrowTransactionsInstance.cancelSale(
  //       presaleAddress,
  //       buyersWalletToAdd,
  //       seller,
  //       {
  //         from: badBuyer,
  //       }
  //     );
  //   } catch (e) {
  //     assert.equal(e.reason, "You are not the buyer or seller of this sale");
  //   }

  //   // should not be cancelled
  //   const saleInfo = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress,
  //     buyersWalletToAdd
  //   );

  //   assert.equal(
  //     saleInfo[0].cancelled,
  //     false,
  //     "The sale could be cancelled by the Seller or Buyer. No one should be able to cancel someone elses sale"
  //   );
  // });

  // it("should allow a buyer to accept a sale, and cancel after the presale starts if buyer wallet not added.", async () => {
  //   const escrowTransactionsInstance = await EscrowTransactionsV2.new();
  //   const presaleAddress = "0x0000000000000000000000000000000000000123";
  //   const seller = accounts[0];
  //   const buyersWalletToAdd = accounts[1];

  //   const price = web3.utils.toWei("1", "ether");

  //   await escrowTransactionsInstance.createSale(
  //     presaleAddress,
  //     buyersWalletToAdd,
  //     price,
  //     { from: seller }
  //   );

  //   await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
  //     from: buyersWalletToAdd,
  //     value: price,
  //   });

  //   // wait 30 minutes
  //   await time.increase(time.duration.minutes(30));

  //   // post to cancellation endpoint

  //   const buyersPvtKey = `efd6d63d7092c118de18366b94b6e19a2723ba4f3dcbe963386370a1ca0e78d2`;
  //   const signature = await web3.eth.accounts.sign(
  //     "I'm the real owner",
  //     buyersPvtKey
  //   );

  //   const buyersBalanceBeforeValidCancellation = await web3.eth.getBalance(
  //     buyersWalletToAdd
  //   );

  //   await axios.post(urlForBuyerToCancel, {
  //     presale: presaleAddress,
  //     seller,
  //     walletToAdd: buyersWalletToAdd,
  //     deployedAddress: escrowTransactionsInstance.address,
  //     signature: signature.signature,
  //   });

  //   const buyersBalanceAfterValidCancellation = await web3.eth.getBalance(
  //     buyersWalletToAdd
  //   );

  //   // should not be cancelled
  //   const saleInfo = await escrowTransactionsInstance.getSaleInfo(
  //     seller,
  //     presaleAddress,
  //     buyersWalletToAdd
  //   );

  //   assert.equal(
  //     saleInfo[0].cancelled,
  //     true,
  //     "The first sale should be cancelled as buyer called API and sale started, his wallet wasnt added."
  //   );

  //   assert(
  //     buyersBalanceAfterValidCancellation >
  //       buyersBalanceBeforeValidCancellation,
  //     "Buyers balance should be higher after valid cancellation"
  //   );
  //   //
  // });
});
