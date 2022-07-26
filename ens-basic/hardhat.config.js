require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ETHER_SCAN_API = process.env.ETHER_SCAN_API;

// Replace this private key with your Goerli account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    ropsten: {
      // url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      url: `https://ropsten.infura.io/v3/f655b88124184d209b6066f2b1b9d2d1`,

      
      // url: `https://ropsten.infura.io/v3/f546e068edaa47a78c5b5414aa9d05ec`,
      accounts: [`0x${PRIVATE_KEY}`],
      confirmations: 2,
      gas: 2100000,
      gasPrice: 8000000000,
      saveDeployments: true
    },
    // ropsten: {
    //   // url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    //   url: `https://ropsten.infura.io/v3/bedd7449d89f467e98586ced53a99e88`,
    //   accounts: [`0x${PRIVATE_KEY}`]
    // },
    
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: `${ETHER_SCAN_API}`
  }
};


// ENS  Registery: 0x1e7426a2b72B768bBBC5B2686280aB51196592FB
// ENS Resolver: 0x02E96820E02eFF10A88eF2e5e4E90b86e3429708
// ENS Base Registar: 0xC36606d59d7570a26B1040c572Adbfd1936a5085
// ENS ReverseRegistrar: 0x6DFf05F3D006b48FAA57176939dc4c6617522086
// done