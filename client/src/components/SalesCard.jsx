import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import { ethers } from "ethers";
import escrowAbi from "../contracts/OpenBookV2.json";
import { useEffect } from "react";
import { ClipBoardText } from "./ClipBoardText";
import { message } from "antd";

const showSuccess = (msg) => {
  message.success({
    content: msg,
    duration: 3,
  });
};

export const SalesCard = ({ sale, isSeller = true, refetchSales }) => {
  const { chain } = useNetwork();

  const { config: acceptSaleConfig } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id]?.address,
    abi: escrowAbi.abi,
    functionName: "acceptSaleAsBuyer",
    args: [sale.sellerAddress, sale.presaleAddress, sale.price],
    enabled:
      !sale.buyerAcceptedSaleAndSentBnbToContract &&
      !sale.cancelled &&
      !isSeller,

    overrides: {
      value: sale.price,
    },
  });

  const { writeAsync: acceptSaleAsync, data: acceptSaleTxData } =
    useContractWrite(acceptSaleConfig);

  const { isLoading: isAcceptSaleLoading, isSuccess: isAcceptSaleSuccess } =
    useWaitForTransaction({
      hash: acceptSaleTxData?.hash,
      onSuccess: () => {
        console.log(
          "Accept sale success, refetching cancel sale config. this sale card: ",
          sale
        );
        showSuccess("Sale accepted!");

        refetchCancelSaleConfig();
        refetchSales();
      },
    });

  useEffect(() => {
    let timeOut;
    if (
      sale.buyerAcceptedSaleAndSentBnbToContract &&
      !sale.cancelled &&
      !sale.moneySentToSellerByContract
    ) {
      console.log(
        "This sale has been accepted by buyer, and is not cancelled. Refetching cancel sale config every 10 seconds. sale: ",
        sale
      );
      timeOut = setInterval(() => {
        refetchCancelSaleConfig();
      }, 10000);
    } else {
      clearInterval(timeOut);
    }
    return () => {
      clearInterval(timeOut);
    };
  }, [sale]);

  const {
    config: completeSaleConfig,
    refetch: refetchCompleteSaleConfig,
    isError: isCompleteSaleConfigError,
  } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id]?.address,
    abi: escrowAbi.abi,
    functionName: "completeSale",
    args: [sale.sellerAddress, sale.presaleAddress, sale.buyerAddress],
    enabled:
      sale.buyerAcceptedSaleAndSentBnbToContract &&
      !sale.cancelled &&
      !sale.moneySentToSellerByContract &&
      isSeller,
    onError: (error) => {
      console.log("Complete sale error: ", error);
    },
  });

  useEffect(() => {
    let interval;
    if (
      isSeller &&
      sale.buyerAcceptedSaleAndSentBnbToContract &&
      !sale.cancelled &&
      !sale.moneySentToSellerByContract
    ) {
      console.log("is seller, refetching complete sale config every 60s");
      interval = setInterval(() => {
        console.log("refetching complete sale config");
        refetchCompleteSaleConfig();
      }, 30000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isSeller, sale]);

  const { writeAsync: completeSaleAsync, data: completeSaleTxData } =
    useContractWrite(completeSaleConfig);

  const { isLoading: isCompletingSale } = useWaitForTransaction({
    hash: completeSaleTxData?.hash,
    onSuccess: () => {
      showSuccess("Sale completed!");
      refetchSales();
    },
  });

  const {
    config: cancelSaleConfig,
    isError: isCancelSaleConfigError,
    error: cancelSaleConfigError,
    refetch: refetchCancelSaleConfig,
  } = usePrepareContractWrite({
    address: escrowAbi.networks[chain.id]?.address,
    abi: escrowAbi.abi,
    functionName: "cancelSale",
    args: [sale.presaleAddress, sale.buyerAddress, sale.sellerAddress],
    enabled:
      !sale.cancelled &&
      !sale.moneySentToSellerByContract &&
      (!isSeller ? sale.buyerAcceptedSaleAndSentBnbToContract : true),

    onError: (error) => {
      console.log(
        "Cancel sale error: ",
        error,
        "sale: ",
        sale,
        "enabled: ",
        !sale.cancelled &&
          !sale.moneySentToSellerByContract &&
          (!isSeller ? sale.buyerAcceptedSaleAndSentBnbToContract : true)
      );
    },
  });

  const { writeAsync: cancelSaleAsync, data: cancelSaleTxData } =
    useContractWrite(cancelSaleConfig);

  const { isLoading: cancelTxLoading, isSuccess: cancelTxSuccess } =
    useWaitForTransaction({
      hash: cancelSaleTxData?.hash,
      onSuccess: () => {
        showSuccess("Sale cancelled!");
        refetchSales();
      },
    });

  return (
    <div className="card table__row-action">
      <h3 className="card__header">Pending Sale</h3>
      <div className="card__text">
        {isSeller ? (
          <div className="card__pair">
            <span>Buyer</span>
            <span className="card__address">
              {sale.buyerAddress !== ethers.constants.AddressZero ? (
                <ClipBoardText text={sale.buyerAddress} />
              ) : (
                "No buyer yet"
              )}
            </span>{" "}
          </div>
        ) : (
          <div className="card__pair">
            <span>Seller</span>
            <span
              style={{
                wordBreak: "break-all",
              }}
            >
              <ClipBoardText text={sale.sellerAddress} />
            </span>{" "}
          </div>
        )}

        <div className="card__pair">
          <span>Platform:</span>
          <span> {sale.presalePlatform}</span>{" "}
        </div>

        <div className="card__pair">
          <span>Price</span>
          <span> {(sale.price * 10 ** -18).toFixed(4)} BNB</span>{" "}
        </div>

        <div className="card__pair">
          <span>Presale:</span>
          <span className="card__address">
            <ClipBoardText text={sale.presaleAddress} />
          </span>{" "}
        </div>

        <div className="card__pair">
          {" "}
          <span>Presale Start</span>
          <span>
            {" "}
            {new Date(sale.presaleStartTime * 1000).toUTCString()}
          </span>{" "}
        </div>

        <div className="card__pair">
          <span>Presale End</span>
          <span>
            {" "}
            {new Date(sale.presaleEndTime * 1000).toUTCString()}
          </span>{" "}
        </div>

        <div className="card__pair">
          <span>Outcome</span>
          {sale.cancelled ? (
            <span className="cross">Cancelled</span>
          ) : sale.moneySentToSellerByContract ? (
            <span className="tick">Success</span>
          ) : (
            <span>Pending</span>
          )}
        </div>

        {sale.cancelled ? (
          <></>
        ) : // <span className="cross">Cancelled!</span>
        isSeller ? (
          sale.buyerAcceptedSaleAndSentBnbToContract ? (
            sale.moneySentToSellerByContract ? (
              <></>
            ) : (
              // <span className="tick">Success!</span>
              <>
                <div className="card__pair">
                  <span>Action</span>
                  <div>
                    <button
                      className="btn btn--primary"
                      onClick={completeSaleAsync}
                      disabled={isCompletingSale || isCompleteSaleConfigError}
                      style={
                        isCompletingSale || isCompleteSaleConfigError
                          ? {
                              cursor: "not-allowed",
                              opacity: "0.5",
                            }
                          : { opacity: "1" }
                      }
                    >
                      {isCompletingSale ? "Completing..." : "Complete"}
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={cancelSaleAsync}
                      disabled={cancelTxLoading || isCancelSaleConfigError}
                      style={
                        cancelTxLoading || isCancelSaleConfigError
                          ? { cursor: "not-allowed", opacity: "0.5" }
                          : {}
                      }
                    >
                      {cancelTxLoading ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                  {isCompleteSaleConfigError && (
                    <span className="card__error">
                      Wait until buyers wallet is added to presale
                    </span>
                  )}
                </div>
              </>
            )
          ) : (
            <>
              <div className="card__pair">
                <span>Action</span>
                <div>
                  <button
                    className="btn btn--primary"
                    onClick={cancelSaleAsync}
                    disabled={cancelTxLoading || isCancelSaleConfigError}
                    style={
                      cancelTxLoading || isCancelSaleConfigError
                        ? { cursor: "not-allowed", opacity: "0.5" }
                        : {}
                    }
                  >
                    {cancelTxLoading ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
                {isCancelSaleConfigError &&
                  (cancelSaleConfigError?.error?.data?.message.includes(
                    "wallet has already been added"
                  ) ? (
                    <span className="card__error">
                      Your wallet has already been added!
                    </span>
                  ) : (
                    <span className="card__error">
                      Wait until presale starts
                    </span>
                  ))}
              </div>
            </>
          )
        ) : sale.buyerAcceptedSaleAndSentBnbToContract ? (
          sale.moneySentToSellerByContract ? (
            <></>
          ) : (
            // <span className="tick">Success!</span>
            <>
              <div className="card__pair">
                <span>Action</span>
                <button
                  className="btn btn--primary"
                  onClick={cancelSaleAsync}
                  disabled={cancelTxLoading || isCancelSaleConfigError}
                  style={
                    cancelTxLoading || isCancelSaleConfigError
                      ? { cursor: "not-allowed", opacity: "0.5" }
                      : {}
                  }
                >
                  {cancelTxLoading ? "Cancelling..." : "Cancel"}
                </button>
                {cancelSaleConfigError &&
                  (cancelSaleConfigError?.error?.data?.message.includes(
                    "wallet has already been added"
                  ) ? (
                    <span className="card__error">
                      Your wallet has already been added!
                    </span>
                  ) : (
                    <span className="card__error">
                      Wait until presale starts!!!
                    </span>
                  ))}
                {!isCancelSaleConfigError &&
                  (Date.now() < sale.presaleStartTime * 1000 ? (
                    <span className="card__error">
                      You can cancel within 5 minutes
                    </span>
                  ) : (
                    <span className="card__error">
                      Your wallet hasn't been added, feel free to cancel
                    </span>
                  ))}
              </div>
            </>
          )
        ) : (
          <>
            <div className="card__pair">
              <span>Action</span>
              <button
                className="btn btn--primary"
                onClick={() => {
                  acceptSaleAsync(
                    sale.sellerAddress,
                    sale.presaleAddress,
                    sale.price
                  );
                }}
                disabled={isAcceptSaleLoading}
                style={
                  isAcceptSaleLoading
                    ? { cursor: "not-allowed", opacity: "0.5" }
                    : {}
                }
              >
                {isAcceptSaleLoading ? "Accepting..." : "Accept Sale"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
