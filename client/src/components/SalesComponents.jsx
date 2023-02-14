import React, { useState } from "react";
import { useEffect } from "react";
import { useEth } from "../contexts/EthContext";
import { completeSaleRequest, completeCancelRequest } from "../apiInteractor";

/*
struct SaleInfo {
    uint256 creationTimestamp;
    address sellerAddress;
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

export const ViewSales = ({ usersAddress, isSeller = true }) => {
  const { state } = useEth();

  const [sales, setSales] = useState(null);

  const fetchAndSetSales = async () => {
    console.log(`Fetching sales for ${usersAddress}. Is seller? ${isSeller}`);
    let saleData;
    switch (isSeller) {
      case true:
        saleData = await state.contract.methods
          .getSalesForSeller(usersAddress)
          .call();
        console.log(`Got sales for ${usersAddress}:`, saleData);
        break;
      case false:
        saleData = await state.contract.methods
          .getSalesForBuyer(usersAddress)
          .call();
        break;
    }
    console.log(`Got sales for ${usersAddress}:`, saleData);
    setSales(saleData);
  };

  //const [refs, setRefs] = useState([]);

  const [expandedSaleIndex, setExpandedSaleIndex] = useState(null);

  useEffect(() => {
    setSales(null);
  }, [state]);

  useEffect(() => {
    fetchAndSetSales();
  }, [isSeller]);

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
                    className={
                      index === expandedSaleIndex
                        ? " table__row row-action--expanded"
                        : "table__row action-hidden "
                    }
                    key={index}
                  >
                    <div
                      className="table__row-details"
                      key={sale}
                      onClick={() => handleRowClick(index)}
                    >
                      <li className="table__body-item table-address optional">
                        {sale.buyerAddress}
                      </li>
                      <li className="table__body-item optional">
                        {sale.presalePlatform}
                      </li>
                      <li className="table__body-item">
                        {(sale.price * 10 ** -18).toFixed(2)} BNB
                      </li>
                      {!sale.cancelled ? (
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
                        )
                      ) : (
                        <li className="table__body-item action cross">
                          Cancelled
                        </li>
                      )}

                      <li className="show-row-action">
                        <i className="burger"> </i>
                      </li>
                    </div>
                    <SalesCard
                      refetchSales={fetchAndSetSales}
                      sale={sale}
                      isSeller={isSeller}
                    />
                  </ul>
                ))
              ) : (
                <h3
                  style={{
                    textAlign: "center",
                  }}
                >
                  No sales yet.
                </h3>
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SalesCard = ({ sale, isSeller = true, refetchSales }) => {
  const { state } = useEth();
  const acceptSale = async (sellersAddress, presaleAddress) => {
    console.log(
      `Accepting sale for ${sellersAddress} and presale ${presaleAddress}...`
    );
    console.log(`Accounts: ${state.accounts}`);
    const priceInWei = sale.price;
    console.log(`Price in wei: ${priceInWei}`);
    await state.contract.methods
      .acceptSaleAsBuyer(sellersAddress, presaleAddress)
      .send({ from: state.accounts[0], value: priceInWei });
    refetchSales();
  };

  // when we cancel/complete with API changes aren't reflected in UI until refresh after a while, so we
  // will use state to keep track of the outcome of the API call and display it to the user.
  const [cancelSaleOutcome, setCancelSaleOutcome] = useState(null);
  const [completeSaleOutcome, setCompleteSaleOutcome] = useState(null);

  // Call API in future.
  const completeSale = async (sellerAddress, presaleAddress, walletToAdd) => {
    console.log(
      `Completing sale for seller ${sellerAddress}, presale ${presaleAddress} and wallet ${walletToAdd}...`
    );

    const signature = await state.web3.eth.personal.sign(
      "I'm the real owner",
      state.accounts[0]
    );

    console.log(`signature: ${signature}`);
    try {
      const result = await completeSaleRequest(
        signature,
        state.contract._address,
        sellerAddress,
        presaleAddress,
        walletToAdd
      );
      console.log("Result of compelte sale call from API: ", result);

      setCompleteSaleOutcome("completed");
    } catch (e) {
      console.log(e);
    }
  };

  const cancelSale = async (
    sellerAddress,
    presaleAddress,
    walletToAdd,
    timeSaleWasAccepted
  ) => {
    console.log(
      `Cancellling sale for seller ${sellerAddress}, presale ${presaleAddress} and wallet ${walletToAdd}..., timeSaleWasAccepted: ${timeSaleWasAccepted}`
    );

    // check if timeSaleWasAccepted is less than 5 minutes ago
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - timeSaleWasAccepted;
    const timeDiffInMinutes = timeDiff / 1000 / 60;
    console.log(`Time diff in minutes: ${timeDiffInMinutes}`);

    // only applies to buyers as they cant cancel within 5 mintues of accepting
    if (!isSeller) {
      if (timeDiffInMinutes > 5 || true) {
        console.log(
          `You can't cancel a sale after 5 minutes! (Doing api call to check if sale started and wallet hasn't been added yet - HARDOCDED TO CANCEL FOR TESTS))`
        );
        const signature = await state.web3.eth.personal.sign(
          "I'm the real owner",
          state.accounts[0]
        );
        try {
          await completeCancelRequest(
            signature,
            state.contract._address,
            sellerAddress,
            presaleAddress,
            walletToAdd
          );
          setCancelSaleOutcome("cancelled");
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log("Time diff is less than 5 minutes, cancelling sale...");
        await state.contract.methods
          .cancelSale(presaleAddress, walletToAdd, sellerAddress)
          .send({ from: state.accounts[0] });
      }
    } else {
      await state.contract.methods
        .cancelSale(presaleAddress, walletToAdd, sellerAddress)
        .send({ from: state.accounts[0] });
    }
  };

  return (
    <div className="card table__row-action">
      <h3 className="card__header">Pending Sale</h3>
      <p className="card__text">
        {isSeller
          ? "Buyer Address: " + sale.buyerAddress
          : "Seller Address: " + sale.sellerAddress}
        <br />
        Platform: {sale.presalePlatform}
        <br />
        Price: {(sale.price * 10 ** -18).toFixed(3)} BNB
        <br />
      </p>
      {sale.cancelled || cancelSaleOutcome == "cancelled" ? (
        <span className="cross">Cancelled!!!!</span>
      ) : isSeller ? (
        sale.buyerAcceptedSaleAndSentBnbToContract ? (
          sale.moneySentToSellerByContract ||
          completeSaleOutcome == "completed" ? (
            <span className="tick">Success!</span>
          ) : (
            <button
              className="btn btn--primary"
              onClick={() => {
                completeSale(
                  sale.sellerAddress,
                  sale.presaleAddress,
                  sale.buyerAddress
                );
              }}
            >
              Complete Sale
            </button>
          )
        ) : (
          <button
            className="btn btn--primary"
            onClick={() => {
              cancelSale(
                sale.sellerAddress,
                sale.presaleAddress,
                sale.buyerAddress,
                sale.buyerAcceptedTimestamp
              );
            }}
          >
            Cancel
          </button>
        )
      ) : sale.buyerAcceptedSaleAndSentBnbToContract ? (
        sale.moneySentToSellerByContract ||
        completeSaleOutcome == "completed" ? (
          <span className="tick">Success!</span>
        ) : (
          <button
            className="btn btn--primary"
            onClick={() => {
              cancelSale(
                sale.sellerAddress,
                sale.presaleAddress,
                sale.buyerAddress,
                sale.buyerAcceptedTimestamp
              );
            }}
          >
            Cancel
          </button>
        )
      ) : (
        <button
          className="btn btn--primary"
          onClick={() => {
            acceptSale(sale.sellerAddress, sale.presaleAddress);
          }}
        >
          Accept Sale
        </button>
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
      {state.accounts?.length ? (
        <>
          <form
            className="card form-group"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div class="form-group__control">
              <label class="form-group__label tick" htmlFor="walletToAdd">
                Wallet To Add
              </label>
              <input
                required
                type="text"
                placeholder="Wallet to Add (buyer)"
                value={walletToAdd}
                onChange={(e) => setWalletToAdd(e.target.value)}
                class="form-group__input"
                id="walletToAdd"
              />
            </div>
            <div class="form-group__control">
              <label class="form-group__label tick" htmlFor="presale">
                Presale Wallet
              </label>
              <input
                required
                type="text"
                placeholder="Presale Address"
                value={presaleAddress}
                class="form-group__input"
                onChange={(e) => setPresaleAddress(e.target.value)}
              />
            </div>
            <div class="form-group__control">
              <label class="form-group__label tick" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                required
                type="number"
                placeholder="Price"
                value={price}
                class="form-group__input"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <button
              disabled={
                isInvalidAddress(walletToAdd) ||
                isInvalidAddress(presaleAddress)
              }
              onClick={createSale}
              class="btn btn--primary"
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
