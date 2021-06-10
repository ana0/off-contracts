const Off = artifacts.require('Off');
const edition = require('../edition.json');

module.exports = function (deployer) {
  deployer.deploy(Off, 'Off', 'OFF', web3.utils.toWei('35'))
    .then(async (off) => {
      await off.setBaseURI('https://isthisa.computer/ipfs/');
      await off.setController(process.env.CONTROLLER_ADDRESS);
      await off.setContractURI('https://gateway.pinata.cloud/ipfs/QmUjEZo8UUumNayDKDAFsC1JT9677osx3zAdbCLcEVMmxb/contract-metadata.json');
      let i = 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
      i += 1;
      await off.mint(
        i,
        true,
        edition.off[i].token_uri,
        edition.off[i].public_hash,
        edition.off[i].public_hash,
      );
    });
};
