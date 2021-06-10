require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
    },
    xdai: {
      provider() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          'https://dai.poa.network',
        );
      },
      network_id: 100,
      gas: 12487794,
      gasPrice: 1000000000,
    },
    matic: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        'https://rpc-mainnet.matic.network',
      ),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: false,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.6', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      //settings: { // See the solidity docs for advice about optimization and evmVersion
        //optimizer: {
          //enabled: true,
          //runs: 200,
        //},
      //  evmVersion: "byzantium"
      //},
    },
  },
  db: {
    enabled: false,
  },
};
