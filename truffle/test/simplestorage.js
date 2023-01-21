

const EscrowTransactions = artifacts.require("EscrowTransactions");

contract('EscrowTransactions', () => {
  it('should create a new escrow transactions with correct values', async() => {
    const escrowTransactionsInstance = await EscrowTransactions.deployed();
    const presaleAddress = '0x0000000000000000000000000000000000000123';
    const walletToAdd = '0x0000000000000000000000000000000000009999'
    const price = '1000000000000000000';
    const seller = '0xc319d186f4d66863f60bdd4daccf74142c477b28';

    await escrowTransactionsInstance.createSale(presaleAddress, walletToAdd, price);

    const sale = await escrowTransactionsInstance.getSaleInfo(seller, presaleAddress,walletToAdd);

    /*struct SaleInfo {
    bool buyerAcceptedSaleAndSentBnbToContract;
    bool cancelled;
    bool walletAdded;
    string presalePlatform;
    bool moneySentToSellerByContract;
    uint256 price;
} */
    assert.equal(sale.price, price, "Sale price is not correct");
    assert.equal(sale.presalePlatform, "Pink", "Presale platform is not correct");
    assert.equal(sale.buyerAcceptedSaleAndSentBnbToContract, false, "Buyer has not accepted sale and sent BNB to contract");
    assert.equal(sale.cancelled, false, "Sale hasn't been cancelled");
    assert.equal(sale.walletAdded, false, "Wallet has not been added");
    assert.equal(sale.moneySentToSellerByContract, false, "Money has not been sent to seller by contract");



  });

  });