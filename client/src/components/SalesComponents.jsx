import React, { useState } from "react";
import { useEffect } from "react";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";

import { message } from "antd";
import { ethers } from "ethers";
import escrowAbi from "../contracts/OpenBookV2.json";

import { SalesCard } from "./SalesCard";
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
const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

const showSuccess = (msg) => {
  message.success({
    content: msg,
    duration: 3,
  });
};

const sortFunctionForSalesByStatus = (saleA, saleB) => {
  if (saleA.cancelled && saleB.cancelled) {
    return saleA.creationTimestamp - saleB.creationTimestamp;
  } else if (saleA.cancelled) {
    return 1;
  } else if (saleB.cancelled) {
    return -1;
  } else if (saleA.walletAdded && saleB.walletAdded) {
    return saleA.creationTimestamp - saleB.creationTimestamp;
  } else if (saleA.walletAdded) {
    return 1;
  } else if (saleB.walletAdded) {
    return -1;
  } else if (
    saleA.buyerAcceptedSaleAndSentBnbToContract &&
    saleB.buyerAcceptedSaleAndSentBnbToContract
  ) {
    return saleA.creationTimestamp - saleB.creationTimestamp;
  } else if (saleA.buyerAcceptedSaleAndSentBnbToContract) {
    return -1;
  } else if (saleB.buyerAcceptedSaleAndSentBnbToContract) {
    return 1;
  } else if (
    saleA.moneySentToSellerByContract &&
    saleB.moneySentToSellerByContract
  ) {
    return saleA.creationTimestamp - saleB.creationTimestamp;
  } else if (saleA.moneySentToSellerByContract) {
    return -1;
  } else if (saleB.moneySentToSellerByContract) {
    return 1;
  } else {
    return (saleA.creationTimestamp - saleB.creationTimestamp) * -1;
  }
};

const truncateEthAddress = function (address) {
  var match = address.match(truncateRegex);
  if (!match) return address;
  return match[1] + "\u2026" + match[2];
};
export const ViewSales = ({ usersAddress, isSeller = true }) => {
  const { chain } = useNetwork();
  const { data: sales, refetch } = useContractRead({
    abi: escrowAbi.abi,
    address: escrowAbi.networks[chain.id]?.address,
    functionName: isSeller ? "getSalesForSeller" : "getSalesForBuyer",
    args: [usersAddress],
    onSuccess: (data) => {
      console.log("data", data);
    },
  });

  const { address } = useAccount();

  const [expandedSaleIndex, setExpandedSaleIndex] = useState(null);

  const handleRowClick = (index) => {
    if (index === expandedSaleIndex) {
      setExpandedSaleIndex(null);
      return;
    } else {
      setExpandedSaleIndex(index);
    }
  };
  return (
    <div className="content">
      {isSeller ? (
        <>
          <div className="role-header">
            <h1 className="role-title">YOU ARE A SELLER</h1>
            <div className="seller-icon"></div>
          </div>
          <h2 className="title">Your Sales</h2>
        </>
      ) : (
        <>
          <div className="role-header">
            <h1 className="role-title">YOU ARE A BUYER</h1>
            <div className="buyer-icon"></div>
          </div>
          <h2 className="title">Your Purchases</h2>
        </>
      )}
      <div className="table" id="dim">
        <ul className="table__header">
          <li className="table__header-item optional">Presale</li>
          <li className="table__header-item optional">Seller</li>
          <li className="table__header-item">Price</li>
          <li className="table__header-item">Status</li>
          <li className="table__header-item optional">Action</li>
        </ul>

        {address ? (
          <>
            <div className="table__body">
              {sales?.length ? (
                sales
                  .slice()
                  .sort(sortFunctionForSalesByStatus)
                  .map((sale, index) => (
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
                          {truncateEthAddress(sale.presaleAddress)}
                        </li>
                        <li className="table__body-item optional">
                          {truncateEthAddress(sale.sellerAddress)}
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

export const ViewOpenBookSales = ({ usersAddress, isSeller = true }) => {
  const { chain } = useNetwork();
  const {
    data: sales,
    isError,
    isLoading,
    refetch,
  } = useContractRead({
    abi: escrowAbi.abi,
    address: escrowAbi.networks[chain.id]?.address,
    functionName: "getPendingOpenBookSales",
    onSuccess: (data) => {
      console.log("data", data);
    },
  });

  const { address } = useAccount();

  const [expandedSaleIndex, setExpandedSaleIndex] = useState(null);

  const handleRowClick = (index) => {
    if (index === expandedSaleIndex) {
      setExpandedSaleIndex(null);
      return;
    } else {
      setExpandedSaleIndex(index);
    }
  };
  return (
    <div className="content">
      <div className="role-header">
        <h1 className="role-title">YOU ARE A BUYER</h1>
        <div className="buyer-icon"></div>
      </div>
      <h1 className="title">Open Book Sales</h1>
      <div className="table" id="dim">
        <ul className="table__header">
          <li className="table__header-item optional">Presale</li>
          <li className="table__header-item optional">Seller</li>
          <li className="table__header-item">Price</li>
          <li className="table__header-item">Status</li>
          <li className="table__header-item optional">Action</li>
        </ul>

        {address ? (
          <>
            <div className="table__body">
              {sales?.filter((sale) => address !== sale.sellerAddress)
                ?.length ? (
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
                        {truncateEthAddress(sale.presaleAddress)}
                      </li>
                      <li className="table__body-item optional">
                        {truncateEthAddress(sale.sellerAddress)}
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
                  No open-book sales yet.
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

const isInvalidAddress = (address) => {
  const invalid = !ethers.utils.isAddress(address);
  return invalid;
};

export const CreateSale = () => {
  const { address } = useAccount();

  const { chain } = useNetwork();

  const [isOpenBook, setIsOpenBook] = useState(false);
  const [presaleAddress, setPresaleAddress] = useState("");
  const [walletToAdd, setWalletToAdd] = useState("");
  const [price, setPrice] = useState(0);

  const {
    config: createSaleConfig,
    isError: createSalePrepareTxFailed,
    refetch,
  } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id]?.address,
    functionName: "createSale",
    abi: escrowAbi.abi,
    args: !isOpenBook
      ? [
          presaleAddress,
          walletToAdd,
          price > 0 ? ethers.utils.parseEther(price).toString() : 0,
        ]
      : [
          presaleAddress,
          ethers.constants.AddressZero,
          price > 0 ? ethers.utils.parseEther(price).toString() : 0,
        ],
    enabled: false,

    onSuccess: () => {
      console.log("Create sale success");
    },
    onSettled: (data) => {
      console.log("Create sale settled ", data);
    },
  });

  useEffect(() => {
    if (isOpenBook) {
      if (!isInvalidAddress(presaleAddress)) {
        refetch();
      } else {
        console.log("Create sale form is invalid");
      }
    } else {
      if (!isInvalidAddress(presaleAddress) && !isInvalidAddress(walletToAdd)) {
        refetch();
      } else {
        console.log("Create sale form is invalid");
      }
    }
  }, [presaleAddress, walletToAdd, price, isOpenBook]);

  const { write: createSaleAsync, data: createSaleResult } =
    useContractWrite(createSaleConfig);

  const { isLoading: createSaleTransactionLoading, isSuccess } =
    useWaitForTransaction({
      hash: createSaleResult?.hash,
      onSuccess: () => {
        console.log("Create sale transaction success");
        showSuccess("Sale created successfully");
        refetch();
      },
      onError: (error) => {
        console.log("Create sale transaction error: ", error);
      },
    });

  return (
    <div className="content">
      {address ? (
        <>
          <div className="role-header">
            <h1 className="role-title">YOU ARE A SELLER</h1>
            <div className="seller-icon"></div>
          </div>

          <h1 className="title">Create Sale</h1>

          <form
            className="card form-group"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div
              style={{
                display: "flex",
              }}
              className="form-group__control"
            >
              <label
                style={{
                  marginRight: "1rem",
                }}
                className="form-group__label"
                htmlFor="OpenBookSaleCheck"
              >
                Open Book Sale
              </label>
              <input
                type="checkbox"
                className="form-group__input"
                id="OpenBookSaleCheck"
                checked={isOpenBook}
                onChange={(e) => setIsOpenBook(e.target.checked)}
              />
            </div>
            {!isOpenBook && (
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
            )}

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
                min={0}
                step="any"
                type="number"
                placeholder="Price"
                className="form-group__input"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <button
              disabled={
                (!isOpenBook && isInvalidAddress(walletToAdd)) ||
                isInvalidAddress(presaleAddress) ||
                createSalePrepareTxFailed
              }
              style={
                (!isOpenBook && isInvalidAddress(walletToAdd)) ||
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
