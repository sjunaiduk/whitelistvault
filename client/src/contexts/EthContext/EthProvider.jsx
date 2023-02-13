import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifact) => {
    if (artifact) {
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      console.log(
        `Store users adress ${accounts[0]} as JWT token in browser local storage.`
      );

      const signature = await web3.eth.personal.sign(
        "I'm the real owner",
        accounts[0]
      );

      console.log(`signature: ${signature}`);

      const networkID = await web3.eth.net.getId();
      const { abi } = artifact;
      let address, contract;
      try {
        console.log(`networkID: ${networkID}`);
        address = artifact.networks[networkID].address;
        contract = new web3.eth.Contract(abi, address);
      } catch (err) {
        console.error(err);
      }
      dispatch({
        type: actions.init,
        data: { artifact, web3, accounts, networkID, contract },
      });
    }
  }, []);

  const tryInit = async () => {
    try {
      const artifact = require("../../contracts/EscrowTransactionsV2.json");
      init(artifact);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  const logout = useCallback(() => {
    dispatch({ type: actions.logout });
  }, []);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
        tryInit,
        logout,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
