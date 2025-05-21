# zkFold x zkPass: Bring zkPass to Cardano

**zkPass** on Cardano is a smart contract that enables developers to post, verify, and utilize zkPass oracle attestations on the Cardano blockchain. It is a tool that makes new types of DApps possible on Cardano.

This repository contains the zkPass prototype frontend, built with [React](https://react.dev/).

## zkPass client

Instructions for running the zkPass dApp:

### Starting the zkPass dApp

- Run the [backend](https://github.com/zkFold/zkpass-cardano).
- To launch the zkPass frontend, execute
```shell
npm run dev
```
then access the dApp on http://localhost:5173/ .

*Note:*  you must have either [Lace](https://www.lace.io/) or [Eternl](https://eternl.io/) wallet extension installed on your browser.

The zkPass dApp is divided in four sections:

### Setup

Initializes the zkPass setup and sends the zkPass smart contracts (*zkPassToken* verifier and *forwardMint* script) as reference scripts to "zkPass-main", a wallet address of your choice.

*ForwardingMint Tag* is any integer of your choice and serves to differentiate *forwardMint* script addresses.

### Transfer reward

An Ada reward can be locked at the *forwardMint* script address.  It can only be unlocked by burning the corresponding zkPass token.

DApp automatically fills the policy id for the *zkPassToken* verifier, which depends on the initial setup.

### Mint zkPass token

A *zkPass result* is computed and displayed; it is taken as public input for the zkPass computation (setup).

Token minting certifies that proof for this input (i.e. zkPass result) has been provided.

- Currency symbol is the policy id of *zkPassToken* verifier, which is parametrized by the initial setup.
- Token name is the hash of zkPass result.
- Generated proof is passed as redeemer in order to mint the zkPass token.

### Burn and retrieve reward

Allows to unlock the reward at the *forwardMint* script address by burning the zkPass token.

The *token* field (automatically filled) needs to be of the form `policy.tokenname`.
