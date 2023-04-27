import { useWeb3Modal } from "@web3modal/react";
import { useEffect } from "react";

import { useAccount, useDisconnect, useConnect } from "wagmi";
import { bsc } from "wagmi/chains";

export const ConnectWallet = () => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { isSuccess } = useConnect();
  const { open, setDefaultChain } = useWeb3Modal();
  setDefaultChain(bsc);

  useEffect(() => {
    if (isSuccess) {
      window.dataLayer.push({
        event: "userWallet",
        user_id: address,
      });
    }
  }, [isSuccess]);

  return (
    <>
      {address ? (
        <>
          <button
            className="btn btn--primary"
            type="button"
            onClick={disconnect}
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
