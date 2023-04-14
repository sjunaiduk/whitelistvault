import { Web3Button, useWeb3Modal } from "@web3modal/react";

import { useAccount, useDisconnect } from "wagmi";
import { bscTestnet } from "wagmi/chains";

export const ConnectWallet = () => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { open, setDefaultChain } = useWeb3Modal();
  setDefaultChain(bscTestnet);
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
