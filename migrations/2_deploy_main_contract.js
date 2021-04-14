const Off = artifacts.require('Off');

module.exports = function (deployer) {
  deployer.deploy(Off, 'Off', 'OFF', web3.utils.toWei('35'))
    .then(async (off) => {
      await off.setBaseURI('http://localhost:8080/ipfs/');
      await off.mint(1, true, 'QmYzqt8s6Xmv8HtDdQ69zyfpcQdx89Gi8bnUmEZ4AHrT6z', 'QmYzqt8s6Xmv8HtDdQ69zyfpcQdx89Gi8bnUmEZ4AHrT6z', 'QmaNEWataLJrRPr6WF7yqgaj4yT6VQYufBnM15HVXepwCh');
    });
};
