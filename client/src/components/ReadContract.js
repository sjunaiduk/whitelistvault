import { useEth } from "../contexts/EthContext";
import { useState } from "react";

export const ReadContractComponent = () => {
    const {state, dispatch} = useEth();

    const [number, setNumber] = useState(0);

    const {contract} = state;


    const [value, setValue] = useState(null);

    const readContract = async () => {
        const result = await contract.methods.read().call();
        setValue(result);

    }

    const updateContract = async (num) => {
        console.log("Setting number to " + num)
        console.log(`Accounts in state: ${JSON.stringify(state.accounts)}`)
        await contract.methods.write(num).send({from: state.accounts[0]});
        readContract();
    }

    return (
        <div>
            <h1>Read Contract</h1>
            <button onClick={readContract}>Read Contract</button>
            <p>Value: {value}</p>

            <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} />
            <button onClick={() => updateContract(number)}>Set Number</button>
        </div>
    )

}
