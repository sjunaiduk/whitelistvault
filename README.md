# React Truffle Box

This box comes with everything you need to start using Truffle to write, compile, test, and deploy smart contracts, and interact with them from a React app.

## Installation

First ensure you are in an empty directory.

Run the `unbox` command using 1 of 2 ways.

```sh
# Install Truffle globally and run `truffle unbox`
$ npm install -g truffle
$ truffle unbox react
```

```sh
# Alternatively, run `truffle unbox` via npx
$ npx truffle unbox react
```

Start the react dev server.

```sh
$ cd client
$ npm start
  Starting the development server...
```

From there, follow the instructions on the hosted React app. It will walk you through using Truffle and Ganache to deploy the `SimpleStorage` contract, making calls to it, and sending transactions to change the contract's state.

## FAQ

- **How do I use this with Ganache (or any other network)?**

  The Truffle project is set to deploy to Ganache by default. If you'd like to change this, it's as easy as modifying the Truffle config file! Check out [our documentation on adding network configurations](https://trufflesuite.com/docs/truffle/reference/configuration/#networks). From there, you can run `truffle migrate` pointed to another network, restart the React dev server, and see the change take place.

- **Where can I find more resources?**

  This Box is a sweet combo of [Truffle](https://trufflesuite.com) and [Create React App](https://create-react-app.dev). Either one would be a great place to start!

# 3_deploy_openbookv2.js

Deploying 'OpenBookV2'

---

> transaction hash: 0xe8792c7012966da102b22b05ff8e3c50ddbbb1f6795c8f05bcda1be2479850bf
> Blocks: 3 Seconds: 9
> contract address: 0xE3e8B3b9c022882404Bd5Ce091917F52B3c226B2
> block number: 27961364
> block timestamp: 1678571840
> account: 0x5A62034F38f7d451F657A49226e5C64Ba95F020f
> balance: 0.05047194
> gas used: 4952806 (0x4b92e6)
> gas price: 10 gwei
> value sent: 0 ETH
> total cost: 0.04952806 ETH
