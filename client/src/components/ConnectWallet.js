import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";

export const ConnectWallet = () => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

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
          <ConnectKitButton.Custom>
            {({
              isConnected,
              isConnecting,
              show,
              hide,
              address,
              ensName,
              chain,
            }) => {
              return (
                <button onClick={show} className="btn btn--primary">
                  Connect
                </button>
              );
            }}
          </ConnectKitButton.Custom>
        </>
      )}
    </>
  );
};
/**
 *  background-image: linear-gradient(to right, #fe4bc6, #f30baa 40%);
  background-position: right;
  background-size: 300%;
 */
