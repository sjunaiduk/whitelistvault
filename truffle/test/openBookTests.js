const { time } = require("openzeppelin-test-helpers");
const axios = require("axios");

const EscrowTransactionsV2 = artifacts.require("OpenBook");

/**

Accounts:
(0) 0xc319d186f4d66863f60bdd4daccf74142c477b28
(1) 0x00ab82a10913756ce790b6139be6151cd9f4420d
(2) 0x361e10407fe8f5503fe541b9a13ebcf958ebea03
(3) 0x6d7d998fedb705ba70dc627d04934cb66038109a
(4) 0x8809ad4394ef44534735b1a37f97844e824fcf97
(5) 0xeaebe38fba69c2ac48a1927c52e64ddebb33d577
(6) 0x5f26dbd3ec443bf5c9da832369282d6e39599c94
(7) 0x0ab999fceb3198ea45c6bbfa749702da891338d6
(8) 0x25051e07939f5bce8d065854d6b2bd29dc334114
(9) 0xd08f6d0571125c6f7ec137473c1cb80aee4306ea

Private Keys:
(0) 58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab      
(1) efd6d63d7092c118de18366b94b6e19a2723ba4f3dcbe963386370a1ca0e78d2      
(2) 587c852c12bf1bf677ba1f264529992c6f8dbabc15bb52eab09436ebf30b7b03      
(3) f9a50e03134cebf454f8af6bb6870340b9e20bf2938fb3ee8461a927d2eb9b11      
(4) 8a168186d31eb132c6621df30ba32324ed3a9c12f1cf3efd348e34bab33db8ed
(5) bcf7c1b01c9b3536d30bd98aba2914ca04a9bce62b9c24b3fe90cbc56c9a23aa      
(6) b831c8800c64777b81b1f65559e1dfa1d3ccf320c57d51a8968c6e993b53726e      
(7) db1937d0cb3af78148eeb4c1f629b4ec60ce2e4b4121ee75a49e3660e8390c69      
(8) d3dfffa92f32af39d7d7807e92f2d26526f0837b2b601452719eb74ca21dd26e      
(9) 3faebe1172d112d19f28e0302bfc26f3b4bab9298720101dd73b80df8430baba  

 * 
 */
const url = `http://localhost:3000/pinksale/completeTest`;
const urlForBuyerToCancel = `http://localhost:3000/pinksale/cancelAsBuyer`;

contract("OpenBook", (accounts) => {
  it("should create 3 open book transactions and let a buyer accept one, so there will be only 2 open book transactions for that seller", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyer = accounts[1];
    const noAddress = "0x0000000000000000000000000000000000000000";
    const price = "1000000000000000000";

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
        {
          from: buyer,
          value: price,
        }
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
  it("should create 3 open book transactions", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const noAddress = "0x0000000000000000000000000000000000000000";
    const price = "1000000000000000000";

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
    await escrowTransactionsInstance.createSale(
      presaleAddress,
      noAddress,
      price,
      { from: seller }
    );

    let openBookSales =
      await escrowTransactionsInstance.getPendingOpenBookSales();

    /*struct SaleInfo {
        bool buyerAcceptedSaleAndSentBnbToContract;
        bool cancelled;
        bool walletAdded;
        string presalePlatform;
        bool moneySentToSellerByContract;
        uint256 price;
    } */
    const sale = openBookSales[0];
    assert.equal(openBookSales.length, 3, "There should be 3 open book sales");
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
  it("should create a new open book transaction correctly.", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const noAddress = "0x0000000000000000000000000000000000000000";
    const price = "1000000000000000000";

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      noAddress,
      price,
      { from: seller }
    );

    let openBookSales =
      await escrowTransactionsInstance.getPendingOpenBookSales();

    /*struct SaleInfo {
        bool buyerAcceptedSaleAndSentBnbToContract;
        bool cancelled;
        bool walletAdded;
        string presalePlatform;
        bool moneySentToSellerByContract;
        uint256 price;
    } */
    const sale = openBookSales[0];
    assert.equal(openBookSales.length, 1, "There should be 1 open book sale");
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
    const deployedAddress = escrowTransactionsInstance.address;

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

    const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      sellersPrivateKey
    );

    const data = {
      signature: signature.signature,
      seller: seller,
      presale: presaleAddress,
      walletToAdd: buyersWalletToAdd,
      deployedAddress: deployedAddress,
    };

    try {
      const response = await axios.post(url, data);
    } catch (e) {
      console.log(e);
    }

    // const result = await escrowTransactionsInstance.completeSale(
    //   seller,
    //   presaleAddress,
    //   buyersWalletToAdd,
    //   {
    //     from: seller,
    //   }
    // );

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
      seller,
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
      seller,
      {
        from: seller,
      }
    );

    const sellersBalanceBeforeSale = Number(
      web3.utils.fromWei(await web3.eth.getBalance(seller), "ether")
    );

    const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      sellersPrivateKey
    );

    const data = {
      signature: signature.signature,
      seller: seller,
      presale: presaleAddress,
      walletToAdd: buyersWalletToAdd,
      deployedAddress: escrowTransactionsInstance.address,
    };

    try {
      const response = await axios.post(url, data);
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

    const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      sellersPrivateKey
    );

    const data = {
      signature: signature.signature,
      seller: seller,
      presale: presaleAddress,
      walletToAdd: buyersWalletToAdd,
      deployedAddress: escrowTransactionsInstance.address,
    };

    try {
      const response = await axios.post(url, data);
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

    const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      sellersPrivateKey
    );

    try {
      const response = await axios.post(url, {
        signature: signature.signature,
        seller: seller,
        presale: presaleAddress,
        walletToAdd: buyersWalletToAdd,
        deployedAddress: escrowTransactionsInstance.address,
      });
    } catch (e) {}

    try {
      const response = await axios.post(url, {
        signature: signature.signature,
        seller: seller,
        presale: presaleAddress,
        walletToAdd: buyersWalletToAdd2,
        deployedAddress: escrowTransactionsInstance.address,
      });
    } catch (e) {}

    try {
      const response = await axios.post(url, {
        signature: signature.signature,
        seller: seller,
        presale: presaleAddress,
        walletToAdd: buyersWalletToAdd3,
        deployedAddress: escrowTransactionsInstance.address,
      });
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

  it("should let a buyer be part of multiple sales, and return the sales that buyer is part of", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const seller2 = accounts[4];
    const buyersWalletToAdd = accounts[1];
    const presaleAddress2 = accounts[2];
    const presaleAddress3 = accounts[3];

    const price = web3.utils.toWei("1", "ether");

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress2,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress3,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress3,
      buyersWalletToAdd,
      price,
      { from: seller2 }
    );

    const salesForBuyer = await escrowTransactionsInstance.getSalesForBuyer(
      buyersWalletToAdd
    );

    //console.log(salesForBuyer);

    assert.equal(
      salesForBuyer.length,
      4,
      "There should be 4 sales for this buyer"
    );
  });

  it("should let a buyer be part of multiple sales, and return the sales that buyer is part of, the number of pending, active and completed sales should be correct", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const seller2 = accounts[4];
    const buyersWalletToAdd = accounts[1];
    const presaleAddress2 = accounts[2];
    const presaleAddress3 = accounts[3];

    const price = web3.utils.toWei("1", "ether");

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress2,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress3,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress3,
      buyersWalletToAdd,
      price,
      { from: seller2 }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller2,
      presaleAddress3,
      {
        from: buyersWalletToAdd,
        value: price,
      }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller,
      presaleAddress3,
      {
        from: buyersWalletToAdd,
        value: price,
      }
    );

    const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      sellersPrivateKey
    );

    try {
      const response = await axios.post(url, {
        signature: signature.signature,
        seller: seller,
        presale: presaleAddress3,
        walletToAdd: buyersWalletToAdd,
        deployedAddress: escrowTransactionsInstance.address,
      });
    } catch (e) {}

    // 4 Total sales
    // 2 has been accepted
    // 1 Has been completed
    // 2 are pending

    const salesForBuyer = await escrowTransactionsInstance.getSalesForBuyer(
      buyersWalletToAdd
    );

    const pendingSales = salesForBuyer.filter((sale) => {
      return sale.buyerAcceptedSaleAndSentBnbToContract === false;
    });

    const acceptedSales = salesForBuyer.filter((sale) => {
      return sale.buyerAcceptedSaleAndSentBnbToContract === true;
    });

    const completedSales = salesForBuyer.filter((sale) => {
      return sale.moneySentToSellerByContract === true;
    });

    //console.log(salesForBuyer);

    assert.equal(
      salesForBuyer.length,
      4,
      "There should be 4 sales for this buyer"
    );

    assert.equal(
      pendingSales.length,
      2,
      "There should be 2 pending sales for this buyer"
    );

    assert.equal(
      acceptedSales.length,
      2,
      "There should be 2 accepted sales for this buyer"
    );

    assert.equal(
      completedSales.length,
      1,
      "There should be 1 completed sales for this buyer"
    );
  });

  it("should not let a buyer accept and cancel within 5 minutes but allow after.", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const presaleAddress2 = "0x0000000000000000000000000000000000000124";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];

    const price = web3.utils.toWei("1", "ether");

    await escrowTransactionsInstance.createSale(
      presaleAddress,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.createSale(
      presaleAddress2,
      buyersWalletToAdd,
      price,
      { from: seller }
    );

    await escrowTransactionsInstance.acceptSaleAsBuyer(seller, presaleAddress, {
      from: buyersWalletToAdd,
      value: price,
    });

    await escrowTransactionsInstance.acceptSaleAsBuyer(
      seller,
      presaleAddress2,
      {
        from: buyersWalletToAdd,
        value: price,
      }
    );
    const buyersBalanceBeforeValidCancellation = await web3.eth.getBalance(
      buyersWalletToAdd
    );

    // try cancelling a sale right after
    await escrowTransactionsInstance.cancelSale(
      presaleAddress2,
      buyersWalletToAdd,
      seller,
      {
        from: buyersWalletToAdd,
      }
    );
    const buyersBalanceAfterValidCancellation = await web3.eth.getBalance(
      buyersWalletToAdd
    );

    // wait 5 minutes
    await time.increase(time.duration.minutes(5));

    try {
      await escrowTransactionsInstance.cancelSale(
        presaleAddress,
        buyersWalletToAdd,
        seller,
        {
          from: buyersWalletToAdd,
        }
      );
    } catch (e) {
      assert.equal(
        e.reason,
        "You can't cancel a sale after 5 minutes of accepting it (as a buyer)"
      );
    }

    // should not be cancelled
    const saleInfo = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    // should be cancelled
    const saleInfo2 = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress2,
      buyersWalletToAdd
    );

    assert.equal(
      saleInfo[0].cancelled,
      false,
      "The first sale should not be cancelled since buyer cancelled within 5 minutes of accepting"
    );

    assert.equal(
      saleInfo2[0].cancelled,
      true,
      "The second sale should be cancelled since buyer cancelled after 5 minutes of accepting"
    );
    assert(
      buyersBalanceAfterValidCancellation >
        buyersBalanceBeforeValidCancellation,
      "Buyers balance should be higher after valid cancellation"
    );
    //
  });

  it("should not let a buyer try to cancel someone elses sale", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];
    const badBuyer = accounts[2];

    const price = web3.utils.toWei("1", "ether");

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

    // wait 5 minutes
    await time.increase(time.duration.minutes(5));

    // try cancelling a sale after 5 minutes
    try {
      await escrowTransactionsInstance.cancelSale(
        presaleAddress,
        buyersWalletToAdd,
        seller,
        {
          from: badBuyer,
        }
      );
    } catch (e) {
      assert.equal(e.reason, "You are not the buyer or seller of this sale");
    }

    // should not be cancelled
    const saleInfo = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    assert.equal(
      saleInfo[0].cancelled,
      false,
      "The sale could be cancelled by the Seller or Buyer. No one should be able to cancel someone elses sale"
    );
  });

  it("should let a seller make a sale, allow a buyer to accept, but prevent the seller from completing it directly without using the API", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const deployedAddress = escrowTransactionsInstance.address;

    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[1];

    const buyersWalletToAdd = accounts[2];
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

    // try completing the sale directly
    const contractBalanceBeforeSale = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );
    let saleComplete = false;
    try {
      await escrowTransactionsInstance.completeSale(
        seller,
        presaleAddress,
        buyersWalletToAdd,
        {
          from: seller,
        }
      );
      saleComplete = true;
    } catch (e) {
      assert.equal(saleComplete, false, "Sale should not be complete");
    }

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
      contractBalance,
      contractBalanceBeforeSale,
      "Contract balance is not correct"
    );

    assert.equal(
      contractBalance,
      price,
      "The contract has completed the sale without using the API"
    );

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
      "Money was sent to seller by contract even though it shouldn't have been"
    );
  });

  it("should let a seller make a sale, allow a buyer to accept, but prevent a different address from attempting to complete the sale", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const deployedAddress = escrowTransactionsInstance.address;

    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[1];

    const buyersWalletToAdd = accounts[2];
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

    // try completing the sale directly
    const contractBalanceBeforeSale = await web3.eth.getBalance(
      escrowTransactionsInstance.address
    );
    let saleComplete = false;

    // wrong sellers info
    const sellersPrivateKey = `58d7e3ec5139822b22daac4fa8de0a53d44562d47c6bde251fc2e013efc6dfab`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      sellersPrivateKey
    );

    try {
      await axios.post(url, {
        presaleAddress: presaleAddress,
        walletToAdd: buyersWalletToAdd,
        seller: seller,
        signature: signature.signature,
        deployedAddress: deployedAddress,
      });
      saleComplete = true;
    } catch (e) {
      assert.equal(saleComplete, false, "Sale should not be complete");
    }

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
      contractBalance,
      contractBalanceBeforeSale,
      "Contract balance is not correct"
    );

    assert.equal(
      contractBalance,
      price,
      "The contract has completed the sale without using the API"
    );

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
      "Money was sent to seller by contract even though it shouldn't have been"
    );
  });

  it("should allow a buyer to accept a sale, and cancel after the presale starts.", async () => {
    const escrowTransactionsInstance = await EscrowTransactionsV2.new();
    const presaleAddress = "0x0000000000000000000000000000000000000123";
    const seller = accounts[0];
    const buyersWalletToAdd = accounts[1];

    const price = web3.utils.toWei("1", "ether");

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

    // wait 30 minutes
    await time.increase(time.duration.minutes(30));

    // post to cancellation endpoint

    const buyersPvtKey = `efd6d63d7092c118de18366b94b6e19a2723ba4f3dcbe963386370a1ca0e78d2`;
    const signature = await web3.eth.accounts.sign(
      "I'm the real owner",
      buyersPvtKey
    );

    const buyersBalanceBeforeValidCancellation = await web3.eth.getBalance(
      buyersWalletToAdd
    );

    await axios.post(urlForBuyerToCancel, {
      presale: presaleAddress,
      seller,
      walletToAdd: buyersWalletToAdd,
      deployedAddress: escrowTransactionsInstance.address,
      signature: signature.signature,
    });

    const buyersBalanceAfterValidCancellation = await web3.eth.getBalance(
      buyersWalletToAdd
    );

    // should not be cancelled
    const saleInfo = await escrowTransactionsInstance.getSaleInfo(
      seller,
      presaleAddress,
      buyersWalletToAdd
    );

    assert.equal(
      saleInfo[0].cancelled,
      true,
      "The first sale should be cancelled as buyer called API and sale started, his wallet wasnt added."
    );

    assert(
      buyersBalanceAfterValidCancellation >
        buyersBalanceBeforeValidCancellation,
      "Buyers balance should be higher after valid cancellation"
    );
    //
  });
});
