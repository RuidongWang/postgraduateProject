/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "extend range news action lyrics arch color pizza only pause enforce near";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 4612388
    },
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic,
          "https://rinkeby.infura.io/v3/fd37c11c05964d05a62ce21071c708a3", 0) 
      }, 
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
  }
};
