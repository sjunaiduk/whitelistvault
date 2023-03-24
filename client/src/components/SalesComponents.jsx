import React, { useState } from "react";
import { useEffect } from "react";
import { useEth } from "../contexts/EthContext";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";

import { ethers } from "ethers";
import escrowAbi from "../contracts/OpenBookV2.json";
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
  const { chain } = useNetwork();
  const {
    data: sales,
    isError,
    isLoading,
    refetch,
  } = useContractRead({
    abi: escrowAbi.abi,
    address: escrowAbi.networks[chain.id].address,
    functionName: isSeller ? "getSalesForSeller" : "getSalesForBuyer",
    args: [usersAddress],
    onSuccess: (data) => {
      console.log("data", data);
    },
  });

  //const [sales, setSales] = useState(null);

  const { address } = useAccount();

  // const fetchAndSetSales = async () => {
  //   console.log(`Fetching sales for ${usersAddress}. Is seller? ${isSeller}`);
  //   let saleData;
  //   switch (isSeller) {
  //     case true:
  //       saleData = await state.contract.methods
  //         .getSalesForSeller(usersAddress)
  //         .call();
  //       console.log(`Got sales for ${usersAddress}:`, saleData);
  //       break;
  //     case false:
  //       saleData = await state.contract.methods
  //         .getSalesForBuyer(usersAddress)
  //         .call();
  //       break;
  //   }

  //   console.log(`Got sales for ${usersAddress}:`, saleData);
  //   setSales(saleData);
  // };

  function updateSpecificSaleByIndex(index, outcome) {
    setSales((prevSales) => {
      return prevSales.map((sale, i) => {
        if (i === index) {
          if (outcome === "cancelled") {
            return { ...sale, cancelled: true };
          } else {
            return { ...sale, moneySentToSellerByContract: true };
          }
        } else {
          return sale;
        }
      });
    });
  }

  //const [refs, setRefs] = useState([]);

  const [expandedSaleIndex, setExpandedSaleIndex] = useState(null);

  // useEffect(() => {
  //   setSales(null);
  // }, [state]);

  // useEffect(() => {
  //   fetchAndSetSales();
  // }, [isSeller]);

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

        {address ? (
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
                      // refetchSales={fetchAndSetSales}
                      sale={sale}
                      isSeller={isSeller}
                      setRowSuccess={() => {
                        updateSpecificSaleByIndex(index, "success");
                      }}
                      setRowCancelled={() => {
                        updateSpecificSaleByIndex(index, "cancelled");
                      }}
                      refetchSales={refetch}
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
              {/* <button onClick={fetchAndSetSales}>Get Sales</button> */}
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
const isInvalidAddress = (address) => {
  const invalid = !ethers.utils.isAddress(address);
  return invalid;
};
const SalesCard = ({ sale, isSeller = true, refetchSales }) => {
  const { chain } = useNetwork();

  const { config: acceptSaleConfig } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id].address,
    abi: escrowAbi.abi,
    functionName: "acceptSaleAsBuyer",
    args: [sale.sellerAddress, sale.presaleAddress, sale.price],
    enabled: !sale.buyerAcceptedSaleAndSentBnbToContract && !sale.cancelled,

    overrides: {
      value: sale.price,
    },
  });

  const { writeAsync: acceptSaleAsync, data: acceptSaleTxData } =
    useContractWrite(acceptSaleConfig);

  const { isLoading: isAcceptSaleLoading } = useWaitForTransaction({
    hash: acceptSaleTxData?.hash,
    onSuccess: () => {
      console.log(
        "Accept sale success, refetching sales, this sale card: ",
        sale
      );
      refetchSales();
    },
  });

  const { config: completeSaleConfig } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id].address,
    abi: escrowAbi.abi,
    functionName: "completeSale",
    args: [sale.sellerAddress, sale.presaleAddress, sale.buyerAddress],
    enabled:
      sale.buyerAcceptedSaleAndSentBnbToContract &&
      !sale.cancelled &&
      !sale.moneySentToSellerByContract,
    onError: (error) => {
      console.log("Complete sale error: ", error);
    },
  });

  const { writeAsync: completeSaleAsync, data: completeSaleTxData } =
    useContractWrite(completeSaleConfig);

  const { isLoading: isCompletingSale } = useWaitForTransaction({
    hash: completeSaleTxData?.hash,
    onSuccess: () => {
      refetchSales();
    },
  });

  const acceptSale = async () => {
    await acceptSaleAsync();
  };

  const { config: cancelSaleConfig, isError: isCancelSaleConfigError } =
    usePrepareContractWrite({
      address: escrowAbi.networks[chain.id].address,
      abi: escrowAbi.abi,
      functionName: "cancelSale",
      args: [sale.presaleAddress, sale.buyerAddress, sale.sellerAddress],
      enabled: !sale.cancelled && !sale.moneySentToSellerByContract,

      onError: (error) => {
        console.log("Cancel sale error: ", error, "sale: ", sale);
      },
    });

  const {
    writeAsync: cancelSaleAsync,
    isLoading: isCancellingSale,
    data: cancelSaleTxData,
  } = useContractWrite(cancelSaleConfig);

  const { isLoading: cancelTxLoading, isSuccess: cancelTxSuccess } =
    useWaitForTransaction({
      hash: cancelSaleTxData?.hash,
      onSuccess: () => {
        refetchSales();
      },
    });

  const completeSale = async (sellerAddress, presaleAddress, walletToAdd) => {
    console.log(
      `Completing sale for seller ${sellerAddress}, presale ${presaleAddress} and wallet ${walletToAdd}...`
    );

    try {
      await completeSaleAsync();
    } catch (e) {
      console.log(e);
    }
  };

  const cancelSale = async () => {
    await cancelSaleAsync();
  };

  return (
    <div className="card table__row-action">
      <h3 className="card__header">Pending Sale</h3>
      <p className="card__text">
        {isSeller
          ? "Buyer: " + sale.buyerAddress
          : "Seller Address: " + sale.sellerAddress}
        <br />
        Platform: {sale.presalePlatform}
        <br />
        Price: {(sale.price * 10 ** -18).toFixed(4)} BNB
        <br />
        Presale: {sale.presaleAddress}
        <br />
        Presale Start: {new Date(sale.presaleStartTime * 1000).toUTCString()}
        <br />
        Presale End: {new Date(sale.presaleEndTime * 1000).toUTCString()}
      </p>
      {sale.cancelled ? (
        <span className="cross">Cancelled!</span>
      ) : isSeller ? (
        sale.buyerAcceptedSaleAndSentBnbToContract ? (
          sale.moneySentToSellerByContract ? (
            <span className="tick">Success!</span>
          ) : (
            <>
              <button
                className="btn btn--primary"
                onClick={() => {
                  completeSale(
                    sale.sellerAddress,
                    sale.presaleAddress,
                    sale.buyerAddress
                  );
                }}
                disabled={isCompletingSale}
                style={
                  isCompletingSale
                    ? {
                        marginRight: "10px",
                        cursor: "not-allowed",
                        opacity: "0.5",
                      }
                    : { marginRight: "10px" }
                }
              >
                {isCompletingSale ? "Completing..." : "Complete"}
              </button>
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
                disabled={cancelTxLoading || isCancelSaleConfigError}
                style={
                  cancelTxLoading || isCancelSaleConfigError
                    ? { cursor: "not-allowed", opacity: "0.5" }
                    : {}
                }
              >
                {cancelTxLoading ? "Cancelling..." : "Cancel"}
              </button>
            </>
          )
        ) : (
          <>
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
              disabled={cancelTxLoading || isCancelSaleConfigError}
              style={
                cancelTxLoading || isCancelSaleConfigError
                  ? { cursor: "not-allowed", opacity: "0.5" }
                  : {}
              }
            >
              {cancelTxLoading ? "Cancelling..." : "Cancel"}
            </button>
            <br />
            {isCancelSaleConfigError && (
              <span className="card__error">Wait until presale starts</span>
            )}
          </>
        )
      ) : sale.buyerAcceptedSaleAndSentBnbToContract ? (
        sale.moneySentToSellerByContract ? (
          <span className="tick">Success!</span>
        ) : (
          <>
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
              // disabled={cancelTxLoading || isCancelSaleConfigError}
              // style={
              //   cancelTxLoading || isCancelSaleConfigError
              //     ? { cursor: "not-allowed", opacity: "0.5" }
              //     : {}
              // }
            >
              {cancelTxLoading ? "Cancelling..." : "Cancel"}
            </button>
            <br />
            {isCancelSaleConfigError ? (
              <span className="card__error">Wait until presale starts</span>
            ) : (
              <span className="card__error">
                You can cancel within 5 minutes
              </span>
            )}
          </>
        )
      ) : (
        <button
          className="btn btn--primary"
          onClick={() => {
            acceptSale(sale.sellerAddress, sale.presaleAddress, sale.price);
          }}
          disabled={isAcceptSaleLoading}
          style={
            isAcceptSaleLoading ? { cursor: "not-allowed", opacity: "0.5" } : {}
          }
        >
          {isAcceptSaleLoading ? "Accepting..." : "Accept Sale"}
        </button>
      )}
    </div>
  );
};

export const CreateSale = () => {
  const { state } = useEth();
  const { address } = useAccount();

  const { chain } = useNetwork();

  const [presaleAddress, setPresaleAddress] = useState("");
  const [walletToAdd, setWalletToAdd] = useState("");
  const [price, setPrice] = useState(0);

  const {
    config: createSaleConfig,
    isError: createSalePrepareTxFailed,
    refetch,
  } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id].address,
    functionName: "createSale",
    abi: escrowAbi.abi,
    args: [
      presaleAddress,
      walletToAdd,
      price > 0 ? ethers.utils.parseEther(price).toString() : 0,
    ],
    enabled:
      !isInvalidAddress(presaleAddress) &&
      !isInvalidAddress(walletToAdd) &&
      !!price,
    onSettled: () => {
      console.log("Create sale settled");
    },
  });

  const { write: createSaleAsync, data: createSaleResult } =
    useContractWrite(createSaleConfig);

  const { isLoading: createSaleTransactionLoading, isSuccess } =
    useWaitForTransaction({
      hash: createSaleResult?.hash,
      onSuccess: () => {
        console.log("Create sale transaction success");
        refetch();
      },
      onError: (error) => {
        console.log("Create sale transaction error: ", error);
      },
    });

  return (
    <div>
      {address ? (
        <>
          <form
            className="card form-group"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="form-group__control">
              <label
                className={
                  isInvalidAddress(walletToAdd)
                    ? "form-group__label cross"
                    : "form-group__label tick"
                }
                htmlFor="walletToAdd"
              >
                Wallet To Add
              </label>
              <input
                required
                type="text"
                placeholder="Wallet to Add (buyer)"
                value={walletToAdd}
                onChange={(e) => setWalletToAdd(e.target.value)}
                className="form-group__input"
                id="walletToAdd"
              />
            </div>
            <div className="form-group__control">
              <label
                className={
                  isInvalidAddress(presaleAddress)
                    ? "form-group__label cross"
                    : "form-group__label tick"
                }
                htmlFor="presale"
              >
                Presale Wallet
              </label>
              <input
                required
                type="text"
                placeholder="Presale Address"
                value={presaleAddress}
                className="form-group__input"
                onChange={(e) => setPresaleAddress(e.target.value)}
              />
            </div>
            <div className="form-group__control">
              <label className="form-group__label" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                required
                type="decimal"
                placeholder="Price"
                className="form-group__input"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <button
              disabled={
                isInvalidAddress(walletToAdd) ||
                isInvalidAddress(presaleAddress) ||
                createSalePrepareTxFailed
              }
              style={
                isInvalidAddress(walletToAdd) ||
                isInvalidAddress(presaleAddress) ||
                createSalePrepareTxFailed ||
                createSaleTransactionLoading
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : { opacity: 1 }
              }
              onClick={createSaleAsync}
              className="btn btn--primary"
            >
              {createSaleTransactionLoading
                ? "Creating Sale..."
                : "Create Sale"}
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
