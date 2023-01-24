import React, { useState } from "react";
import { useEth } from "../contexts/EthContext";

/*
struct SaleInfo {
    address presaleAddress;
    address buyerAddress;
    bool buyerAcceptedSaleAndSentBnbToContract;
    bool cancelled;
    bool walletAdded;
    string presalePlatform;
    bool moneySentToSellerByContract;
    uint256 price;
}
 */

export const ViewSales = ({ sellerAddress }) => {
  const { state } = useEth();

  const [sales, setSales] = useState(null);

  const getSales = async () => {
    console.log(`Fetching sales for ${sellerAddress}...`);
    const saleData = await state.contract.methods
      .getSalesForSeller(sellerAddress)
      .call();
    setSales(saleData);
  };
  return (
    <div>
      <h1>Sales:</h1>
      {state.accounts?.length ? (
        <>
          {sales ? (
            <ul>
              {sales.map((sale) => (
                <li key={sale}>
                  <p>Presale Address: {sale.presaleAddress}</p>
                  <p>Buyer Address: {sale.buyerAddress}</p>
                  <p>
                    Buyer Accepted Sale And Sent BNB To Contract:{" "}
                    {sale.buyerAcceptedSaleAndSentBnbToContract
                      ? "True"
                      : "False"}
                  </p>
                  <p>Cancelled: {sale.cancelled ? "True" : "False"}</p>
                  <p>Wallet Added: {sale.walletAdded ? "True" : "False"}</p>
                  <p>Presale Platform: {sale.presalePlatform}</p>
                  <p>
                    Money Sent To Seller By Contract:{" "}
                    {sale.moneySentToSellerByContract ? "True" : "False"}
                  </p>
                  <p>Price: {sale.price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sales yet.</p>
          )}
          <button onClick={getSales}>Get Sales</button>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
};


export const AcceptSale = () => {
  const { state, web3 } = useEth();

   const [sellersAddress, setSellersAddress] = useState(null);
   const [presaleAddress, setPresaleAddress] = useState(null);

   const isInvalidAddress = (address) => {
    return !web3.utils.isAddress(address);
  };
   

  const acceptSale = async () => {
    console.log(`Accepting sale ${sale}...`);
    await state.contract.methods
      .acceptSaleAsBuyer(sellersAddress, presaleAddress)
      .send({ from: state.accounts[0] });
  };
  return (
    <div>
      <h1>Sales:</h1>
      {state.accounts?.length ? (
        <>
          <form >
            <input
            required
              type="text"
              placeholder="Seller's Address"
              value={sellersAddress}
              onChange={(e) => setSellersAddress(e.target.value)}
            />
            <input
            required
              type="text"
              placeholder="Presale Address"
              value={presaleAddress}
              onChange={(e) => setPresaleAddress(e.target.value)}
            />
            <button disabled = {isInvalidAddress(sellersAddress) && isInvalidAddress(presaleAddress)} onClick={acceptSale}>Accept Sale</button>
          </form>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
}
