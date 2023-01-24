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
  const { state } = useEth();

  const [sellersAddress, setSellersAddress] = useState("");
  const [presaleAddress, setPresaleAddress] = useState("");
  const [price, setPrice] = useState(0);

  const isInvalidAddress = (address) => {
    const invalid = !state.web3.utils.isAddress(address);
    console.log(`Invalid address: ${invalid}`);
    return invalid;
  };

  const acceptSale = async () => {
    console.log(
      `Accepting sale for ${sellersAddress} and presale ${presaleAddress}...`
    );
    console.log(`Accounts: ${state.accounts}`);
    const priceInWei = state.web3.utils.toWei(price.toString(), "ether");
    await state.contract.methods
      .acceptSaleAsBuyer(sellersAddress, presaleAddress)
      .send({ from: state.accounts[0], value: priceInWei });
  };
  return (
    <div>
      <h1>Sales:</h1>
      {state.accounts?.length ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
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
            <input
              required
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button
              disabled={
                isInvalidAddress(sellersAddress) ||
                isInvalidAddress(presaleAddress)
              }
              onClick={acceptSale}
            >
              Accept Sale
            </button>
          </form>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
};

export const CreateSale = () => {
  const { state } = useEth();

  const [presaleAddress, setPresaleAddress] = useState("");
  const [walletToAdd, setWalletToAdd] = useState("");
  const [price, setPrice] = useState(0);

  const isInvalidAddress = (address) => {
    const invalid = !state.web3.utils.isAddress(address);
    console.log(`Invalid address: ${invalid}`);
    return invalid;
  };

  const createSale = async () => {
    console.log(
      `Creating sale for presale ${presaleAddress} and wallet ${walletToAdd}, price ${price}...`
    );
    console.log(`Accounts: ${state.accounts}`);
    let priceInWei = state.web3.utils.toWei(price.toString(), "ether");
    await state.contract.methods
      .createSale(presaleAddress, walletToAdd, priceInWei)
      .send({ from: state.accounts[0] });
  };
  return (
    <div>
      <h1>Sales:</h1>
      {state.accounts?.length ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              required
              type="text"
              placeholder="Wallet to Add (buyer)"
              value={walletToAdd}
              onChange={(e) => setWalletToAdd(e.target.value)}
            />
            <input
              required
              type="text"
              placeholder="Presale Address"
              value={presaleAddress}
              onChange={(e) => setPresaleAddress(e.target.value)}
            />
            <input
              required
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button
              disabled={
                isInvalidAddress(walletToAdd) ||
                isInvalidAddress(presaleAddress)
              }
              onClick={createSale}
            >
              Create Sale
            </button>
          </form>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
};

export const CompleteSale = () => {
  const { state } = useEth();

  const [sellerAddress, setSellerAddress] = useState("");
  const [presaleAddress, setPresaleAddress] = useState("");
  const [walletToAdd, setWalletToAdd] = useState("");

  const isInvalidAddress = (address) => {
    const invalid = !state.web3.utils.isAddress(address);
    console.log(`Invalid address: ${invalid}`);
    return invalid;
  };

  const completeSale = async () => {
    console.log(
      `Completing sale for seller ${sellerAddress}, presale ${presaleAddress} and wallet ${walletToAdd}...`
    );
    console.log(`Accounts: ${state.accounts}`);
    await state.contract.methods
      .completeSale(sellerAddress, presaleAddress, walletToAdd)
      .send({ from: state.accounts[0] });
  };
  return (
    <div>
      <h1>Sales:</h1>
      {state.accounts?.length ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              required
              type="text"
              placeholder="Wallet to Add (buyer)"
              value={walletToAdd}
              onChange={(e) => setWalletToAdd(e.target.value)}
            />
            <input
              required
              type="text"
              placeholder="Presale Address"
              value={presaleAddress}
              onChange={(e) => setPresaleAddress(e.target.value)}
            />
            <input
              required
              type="text"
              placeholder="Seller"
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
            />
            <button
              disabled={
                isInvalidAddress(walletToAdd) ||
                isInvalidAddress(presaleAddress) ||
                isInvalidAddress(sellerAddress)
              }
              onClick={completeSale}
            >
              Complete Sale
            </button>
          </form>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
};
