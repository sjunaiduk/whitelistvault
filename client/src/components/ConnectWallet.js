import { useEth } from "../contexts/EthContext";

export const ConnectWallet = () => {
  const { tryInit, state, logout } = useEth();

  return (
    <>
      {state.accounts?.length ? (
        <>
          <button className="btn btn--primary" type="button" onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <button className="btn btn--primary" onClick={tryInit}>
            Connect
          </button>
        </>
      )}
    </>
  );
};
