import React, { useState } from "react";
import { useEffect } from "react";
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

  const fetchAndSetSales = async () => {
    console.log(`Fetching sales for ${sellerAddress}...`);
    const saleData = await state.contract.methods
      .getSalesForSeller(sellerAddress)
      .call();
    console.log(`Got sales for ${sellerAddress}:`, saleData);
    setSales(saleData);
  };

  //const [refs, setRefs] = useState([]);

  const [expandedSaleIndex, setExpandedSaleIndex] = useState(null);

  // const collapseAllOtherRefs = (index) => {
  //   console.log(`Collapsing all other refs...`);
  //   console.log(`Refs length:`, refs.length);
  //   for (let i = 0; i < refs.length; i++) {
  //     if (i === index) continue;

  //     refs[i].current.classList.remove("row-action--expanded");
  //     refs[i].current.classList.add("action-hidden");
  //   }
  // };

  // useEffect(() => {
  //   let refData = [];
  //   for (let i = 0; i < sales?.length; i++) {
  //     refData.push(React.createRef());
  //   }
  //   setRefs(refData);
  // }, [sales]);

  useEffect(() => {
    setSales(null);
  }, [state]);

  // useEffect(() => {
  //   function p() {
  //     let table = document.getElementById("dim");
  //     console.log(
  //       `Running javascript to set event handlers on table:`,
  //       table,
  //       `sales value:`,
  //       sales
  //     );

  //     const rowDetails = document.querySelectorAll(".table__row-details");
  //     console.log(`rowDetails:`, rowDetails);
  //     for (let i = 0; i < rowDetails.length; i++) {
  //       const row = rowDetails[i];
  //       row.addEventListener("click", function () {
  //         console.log(`Clicked on row:`, row);
  //         document
  //           .querySelectorAll(".row-action--expanded")
  //           .forEach(function (el) {
  //             if (el === row.parentElement) return; // skip the current element (the one we just clicked on
  //             el.classList.toggle("row-action--expanded");
  //             el.classList.toggle("action-hidden");
  //           });

  //         if (!row.parentElement.classList.contains("row-action--expanded")) {
  //           // make table li font color dim
  //           document
  //             .querySelectorAll(".table__row-details")
  //             .forEach(function (el) {
  //               el.style.color = "rgba(255, 255, 255, 0.3)";
  //             });
  //         } else {
  //           document
  //             .querySelectorAll(".table__row-details")
  //             .forEach(function (el) {
  //               el.style.color = "rgba(255, 255, 255, 0.8)";
  //             });
  //         }
  //         console.log(`Toggling row:`, row.parentElement);
  //         row.parentElement.classList.toggle("row-action--expanded");
  //         row.parentElement.classList.toggle("action-hidden");
  //         console.log(`Toggled row:`, row.parentElement);
  //       });
  //       console.log(`Added event listener to row:`, row);
  //     }
  //   }

  //   p();
  // }, [sales]);

  const handleRowClick = (index) => {
    if (index === expandedSaleIndex) {
      setExpandedSaleIndex(null);
      return;
    } else {
      setExpandedSaleIndex(index);
    }
  };
  return (
    <div>
      <h1>Sales:</h1>
      <div className="table" id="dim">
        <ul className="table__header">
          <li className="table__header-item optional">Address</li>
          <li className="table__header-item optional">Platform</li>
          <li className="table__header-item">Price</li>
          <li className="table__header-item">Status</li>
          <li className="table__header-item optional">Action</li>
        </ul>

        {state.accounts?.length ? (
          <>
            <div className="table__body">
              {sales ? (
                sales.map((sale, index) => (
                  <ul
                    // ref={refs[index]}
                    className={
                      index === expandedSaleIndex
                        ? " table__row row-action--expanded"
                        : "table__row action-hidden "
                    }
                    key={index}
                    onClick={() => handleRowClick(index)}
                    // onClick={(e) => {

                    //   e.currentTarget.classList.toggle("row-action--expanded");
                    //   e.currentTarget.classList.toggle("action-hidden");
                    //   console.log(`Row  ref ->`, refs[index].current);
                    //   collapseAllOtherRefs(index);
                    // }}
                  >
                    <div className="table__row-details" key={sale}>
                      <li className="table__body-item table-address optional">
                        {sale.buyerAddress}
                      </li>
                      <li className="table__body-item optional">
                        {sale.presalePlatform}
                      </li>
                      <li className="table__body-item">
                        {sale.price * 10 ** -18} BNB
                      </li>
                      {!sale.cancelled &&
                      sale.buyerAcceptedSaleAndSentBnbToContract ? (
                        sale.moneySentToSellerByContract ? (
                          <li className="table__body-item action tick">
                            Success
                          </li>
                        ) : (
                          <li className="table__body-item action ">
                            Waiting For Seller
                          </li>
                        )
                      ) : (
                        <li className="table__body-item action ">
                          Waiting For Buyer
                        </li>
                      )}

                      <li className="show-row-action">
                        <i className="burger"> </i>
                      </li>
                    </div>
                    <div className="card table__row-action">
                      <h3 className="card__header">Pending Sale</h3>
                      <p className="card__text">
                        Wallet address: 0x0341235421230405305053231
                        <br />
                        Platform: Ethereum
                        <br />
                        Price: 2 ETH
                        <br />
                        Status: Inactive
                        <br />
                      </p>
                      <button className="btn btn--primary">Complete</button>
                    </div>
                  </ul>
                ))
              ) : (
                <p>No sales yet.</p>
              )}
              <button onClick={fetchAndSetSales}>Get Sales</button>
            </div>
          </>
        ) : (
          <h3>You are not connected.</h3>
        )}
      </div>
    </div>
  );
};

export const ViewSalesFromBuyer = ({ buyersAddress }) => {
  const { state } = useEth();

  const [sales, setSales] = useState(null);

  const fetchAndSetSales = async () => {
    console.log(`Fetching sales for buyer ${buyersAddress}...`);
    const saleData = await state.contract.methods
      .getSalesForBuyer(buyersAddress)
      .call();
    console.log(`Got sales for ${buyersAddress}:`, saleData);
    setSales(saleData);
  };

  useEffect(() => {
    setSales(null);
  }, [state]);

  useEffect(() => {
    let table = document.getElementById("dim");
    console.log(
      `Running javascript to set event handlers on table:`,
      table,
      `sales value:`,
      sales
    );

    document.querySelectorAll(".table__row-details").forEach(function (row) {
      row.addEventListener("click", function () {
        document
          .querySelectorAll(".row-action--expanded")
          .forEach(function (el) {
            if (el === row.parentElement) return; // skip the current element (the one we just clicked on
            el.classList.toggle("row-action--expanded");
            el.classList.toggle("action-hidden");
          });

        if (!row.parentElement.classList.contains("row-action--expanded")) {
          // make table li font color dim
          document
            .querySelectorAll(".table__row-details")
            .forEach(function (el) {
              el.style.color = "rgba(255, 255, 255, 0.3)";
            });
        } else {
          document
            .querySelectorAll(".table__row-details")
            .forEach(function (el) {
              el.style.color = "rgba(255, 255, 255, 0.8)";
            });
        }
        row.parentElement.classList.toggle("row-action--expanded");
        row.parentElement.classList.toggle("action-hidden");
      });

      console.log(`Event listener on row:`, row);
    });
  }, [sales]);

  return (
    <div>
      <h1>Sales:</h1>
      <div className="table" id="dim">
        <ul className="table__header">
          <li className="table__header-item optional">Address</li>
          <li className="table__header-item optional">Platform</li>
          <li className="table__header-item">Price</li>
          <li className="table__header-item">Status</li>
          <li className="table__header-item optional">Action</li>
        </ul>

        {state.accounts?.length ? (
          <>
            <div className="table__body">
              {sales ? (
                sales.map((sale, index) => (
                  <ul className="table__row action-hidden" key={index}>
                    <div className="table__row-details" key={sale}>
                      <li className="table__body-item table-address optional">
                        {sale.buyerAddress}
                      </li>
                      <li className="table__body-item optional">
                        {sale.presalePlatform}
                      </li>
                      <li className="table__body-item">
                        {sale.price * 10 ** -18} BNB
                      </li>
                      {!sale.cancelled &&
                      sale.buyerAcceptedSaleAndSentBnbToContract ? (
                        sale.moneySentToSellerByContract ? (
                          <li className="table__body-item action tick">
                            Success
                          </li>
                        ) : (
                          <li className="table__body-item action ">
                            Waiting For Seller
                          </li>
                        )
                      ) : (
                        <li className="table__body-item action ">
                          Waiting For Buyer
                        </li>
                      )}

                      <li className="show-row-action">
                        <i className="burger"> </i>
                      </li>
                    </div>
                    <div className="card table__row-action">
                      <h3 className="card__header">Pending Sale</h3>
                      <p className="card__text">
                        Wallet address: 0x0341235421230405305053231
                        <br />
                        Platform: Ethereum
                        <br />
                        Price: 2 ETH
                        <br />
                        Status: Inactive
                        <br />
                      </p>
                      <button className="btn btn--primary">Complete</button>
                    </div>
                  </ul>
                ))
              ) : (
                <p>No sales yet.</p>
              )}
              <button onClick={fetchAndSetSales}>Get Sales</button>
            </div>
          </>
        ) : (
          <h3>You are not connected.</h3>
        )}
      </div>
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

// function cancelSale(
//   address presale,
//   address walletToAdd,
//   address sellersAddress

export const CancelSale = () => {
  const { state } = useEth();

  const [sellerAddress, setSellerAddress] = useState("");
  const [presaleAddress, setPresaleAddress] = useState("");
  const [walletToAdd, setWalletToAdd] = useState("");

  const isInvalidAddress = (address) => {
    const invalid = !state.web3.utils.isAddress(address);
    console.log(`Invalid address: ${invalid}`);
    return invalid;
  };

  const cancelSale = async () => {
    console.log(
      `Cancellling sale for seller ${sellerAddress}, presale ${presaleAddress} and wallet ${walletToAdd}...`
    );
    console.log(`Accounts: ${state.accounts}`);
    await state.contract.methods
      .cancelSale(presaleAddress, walletToAdd, sellerAddress)
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
              onClick={cancelSale}
            >
              Cancel Sale
            </button>
          </form>
        </>
      ) : (
        <h3>You are not connected.</h3>
      )}
    </div>
  );
};
