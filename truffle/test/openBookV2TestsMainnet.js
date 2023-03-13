const { time } = require("openzeppelin-test-helpers");

const EscrowTransactionsV2 = artifacts.require("OpenBookV2");

contract("OpenBook", (accounts) => {
  const presaleAddress = "0xa49E4960aEDBfd467f48531B392148fDee08E582";
  const presaleTwoAddress = "0x486C9d333B288C6Be32BbdffF771D580b13E37bA";
  let escrowTransactionsInstance;
  beforeEach(async () => {
    escrowTransactionsInstance = await EscrowTransactionsV2.at(
      "0xc1f716d4a69D76B9EDE412b717B27c4a93321f0c"
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

    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller,
      presaleAddress,
      price,
      {
        from: buyer,
        value: price,
      }
    );

    let openBookSales =
      await escrowTransactionsInstance.getPendingOpenBookSales();

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
    const price = web3.utils.toWei("0.01", "ether");

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
    const price = web3.utils.toWei("0.01", "ether");

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

    const sellersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    const contractBalanceBeforeSaleCompleted = Number(
      web3.utils.fromWei(
        await web3.eth.getBalance(escrowTransactionsInstance.address),
        "ether"
      )
    );

    console.log(
      `Contract balance before sale. ${contractBalanceBeforeSaleCompleted}`
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

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    sale = sale[0];

    const contractBalanceAfterSaleCompleted = Number(
      web3.utils.fromWei(
        await web3.eth.getBalance(escrowTransactionsInstance.address),
        "ether"
      )
    );

    assert.equal(
      Math.round(sellersBalanceBeforeSale),
      Math.round(sellersBalanceAfterSale),
      "Seller was sent money when they shouldn't have been as the sale was cancelled."
    );

    assert.equal(
      contractBalanceBeforeSaleCompleted,
      contractBalanceAfterSaleCompleted,
      "Contract balance sent BNB to the seller when it shouldn't have."
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
  it("should let a seller make multiple sales, let the buyer accept them, and complete them", async () => {
    const seller = accounts[0];
    const buyersWalletToAddOne = accounts[2];
    const buyersWalletToAddTwo = accounts[3];
    const buyerOneBalanceBeforeSale = await web3.eth.getBalance(
      buyersWalletToAddOne
    );

    const buyerTwoBalanceBeforeSale = await web3.eth.getBalance(
      buyersWalletToAddTwo
    );
    const sellersBalanceBeforeSale = await web3.eth.getBalance(seller);
    const price = web3.utils.toWei("0.01", "ether");

    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller,
      presaleAddress,
      price,
      {
        from: buyersWalletToAddOne,
        value: price,
      }
    );
    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller,
      presaleAddress,
      price,
      {
        from: buyersWalletToAddTwo,
        value: price,
      }
    );

    const buyerOneBalanceAfterSaleAccepted = await web3.eth.getBalance(
      buyersWalletToAddOne
    );

    const buyerTwoBalanceAfterSaleAccepted = Number(
      web3.utils.fromWei(
        await web3.eth.getBalance(buyersWalletToAddTwo),
        "ether"
      )
    );

    let contractBalanceBeforeSaleCompleted = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );
    try {
      await escrowTransactionsInstance.completeSale(
        seller,
        presaleAddress,
        buyersWalletToAddOne,
        {
          from: seller,
        }
      );

      await escrowTransactionsInstance.completeSale(
        seller,
        presaleAddress,
        buyersWalletToAddTwo,
        {
          from: seller,
        }
      );
    } catch (e) {
      console.log(e);
    }

    const sellersBalanceAfterSale = await web3.eth.getBalance(seller);

    console.log(
      `Seller balance before sale: ${sellersBalanceBeforeSale} after sale: ${sellersBalanceAfterSale}`
    );

    let sale = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAddOne
    );

    sale = sale[0];

    let sale2 = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAddTwo
    );

    sale2 = sale2[1];

    const contractBalanceAfterSaleCompleted = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );

    assert.equal(
      contractBalanceBeforeSaleCompleted > contractBalanceAfterSaleCompleted,
      true,
      "Contract balance didnt send the buyers BNB to the seller"
    );

    assert.equal(
      sale.buyerAcceptedSaleAndSentBnbToContract,
      true,
      "Buyer 1 for some reason did not accept and send BNB to the contract"
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
      "Buyer 2 for some reason did not accept and send BNB to the contract"
    );

    assert.equal(sale2.cancelled, false, "Sale for some reason got cancelled");

    assert.equal(sale2.walletAdded, true, "Wallet should be added here.");

    assert.equal(
      sale2.moneySentToSellerByContract,
      true,
      "Money should be sent to the seller"
    );

    assert.equal(
      sellersBalanceAfterSale > sellersBalanceBeforeSale,
      true,
      "Seller did not receive the BNB from the contract"
    );

    assert.equal(
      buyerOneBalanceAfterSaleAccepted < buyerOneBalanceBeforeSale,
      true,
      "Buyer 1 did not send the BNB to the contract"
    );

    assert.equal(
      buyerTwoBalanceAfterSaleAccepted < buyerTwoBalanceBeforeSale,
      true,
      "Buyer 2 did not send the BNB to the contract"
    );
  });

  // Account[1] has accepted sale for presale 1, and sent BNB to the contract
  // we will make another sale directed at him.
  // 1 accepted sale, 1 pending sale

  // Account[2] has 1 completed sale.
  it("should let a buyer be part of multiple sales, and return the sales that buyer is part of with the correct state of each sale.", async () => {
    const seller = accounts[0];
    const buyersWalletToAddOne = accounts[1];
    const buyersWalletToAddTwo = accounts[2];

    const price = "1000000";

    await escrowTransactionsInstance.createSale(
      presaleTwoAddress,
      buyersWalletToAddOne,
      price,
      { from: seller }
    );

    const salesForBuyerOne = await escrowTransactionsInstance.getSalesForBuyer(
      buyersWalletToAddOne
    );

    const salesForBuyerTwo = await escrowTransactionsInstance.getSalesForBuyer(
      buyersWalletToAddTwo
    );

    const pendingSalesForBuyerOne = salesForBuyerOne.filter((sale) => {
      return (
        sale.buyerAcceptedSaleAndSentBnbToContract === false &&
        sale.moneySentToSellerByContract === false
      );
    });

    const acceptedSalesForBuyerOne = salesForBuyerOne.filter((sale) => {
      return (
        sale.buyerAcceptedSaleAndSentBnbToContract === true &&
        sale.moneySentToSellerByContract === false
      );
    });

    const pendingSalesForBuyerTwo = salesForBuyerTwo.filter((sale) => {
      return (
        sale.buyerAcceptedSaleAndSentBnbToContract === true &&
        sale.moneySentToSellerByContract === false
      );
    });

    const acceptedSalesForBuyerTwo = salesForBuyerTwo.filter((sale) => {
      return (
        sale.buyerAcceptedSaleAndSentBnbToContract === true &&
        sale.moneySentToSellerByContract === false
      );
    });

    const completedSalesForBuyerTwo = salesForBuyerTwo.filter((sale) => {
      return sale.moneySentToSellerByContract === true;
    });

    assert.equal(
      salesForBuyerOne.length,
      2,
      "There should be 2 total sales for  buyer 1"
    );

    assert.equal(
      pendingSalesForBuyerOne.length,
      1,
      "There should be 1 pending sale for  buyer 1"
    );

    assert.equal(
      acceptedSalesForBuyerOne.length,
      1,
      "There should be 1 accepted sale for  buyer 1"
    );

    assert.equal(
      salesForBuyerTwo.length,
      1,
      "There should be 1 total sales for  buyer 2"
    );

    assert.equal(
      pendingSalesForBuyerTwo.length,
      0,
      "There should be 0 pending sale for buyer 2"
    );

    assert.equal(
      acceptedSalesForBuyerTwo.length,
      0,
      "There are currently no accepted sales for buyer 2"
    );

    assert.equal(
      completedSalesForBuyerTwo.length,
      1,
      "There should be 1 completed sale for buyer 2"
    );
  });

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
