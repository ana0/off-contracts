const Off = artifacts.require('Off');

module.exports = function (deployer) {
  deployer.deploy(Off, 'Off', 'OFF', web3.utils.toWei('35'));
};
