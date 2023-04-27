import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";

import { useAccount, useDisconnect, useConnect } from "wagmi";
import { bsc } from "wagmi/chains";

var logged = false;

export const ConnectWallet = () => {
  const { disconnect } = useDisconnect();
  const { address, status } = useAccount();
  const { open, setDefaultChain } = useWeb3Modal();
  setDefaultChain(bsc);

  useEffect(() => {
    if (status === "connected" && !logged) {
      console.log("connected");
      logged = true;
      window.dataLayer.push({ event: "user_id", userWallet: address });
    }
  }, [status]);

  return (
    <>
      {address ? (
        <>
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => {
              disconnect();
              logged = false;
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button onClick={open} className="btn btn--primary">
            Connect
          </button>
        </>
      )}
    </>
  );
};
