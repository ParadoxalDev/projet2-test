const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();
const { MNEMONIC, ALCHEMY_ID, ALCHEMY_ID_MUMBAI } = process.env;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    goerli: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: MNEMONIC,
          providerOrUrl: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_ID}`,
        }),
      network_id: 5,
    },
    mumbai: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: MNEMONIC,
          providerOrUrl: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_ID_MUMBAI}`,
        }),
      network_id: 80001,
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.18", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },
};
