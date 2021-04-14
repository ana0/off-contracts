const {
  BN,
} = require('./helpers/constants');
const {
  assertRevert,
} = require('./helpers/assertRevert');

const Off = artifacts.require('Off');

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('Off', ([_, owner, attacker, controller, user]) => {
  let off = null;
  let tokenId = 0;
  let metadataHash = "QmbLnKaAsUbCXx3JYtMTkgXAeAUx2TN8diuy6qFhwN1zE5";
  let imageHash = "QmRfQakyz9mmKJE8BMQTZMm9QAWsiRp9oroGcyeKFyANid";
  let uri = "uri"
  let baseUri = "http://url.com/"

  beforeEach(async () => {
    off = await Off.new("off", "OFF", web3.utils.toWei('35'), { from: owner });
  });

  it('owner can set baseUri', async () => {
    await off.setBaseURI(baseUri, { from: owner });
    (await off.baseURI()).should.be.equal(baseUri);
  });

  it('attacker can not set baseUri', async () => {
    await assertRevert(off.setBaseURI(baseUri, { from: attacker }));
  });

  it('owner can set controller', async () => {
    await off.setController(controller, { from: owner });
    (await off.controller()).should.be.equal(controller);
  });

  it('attacker can not set controller', async () => {
    await assertRevert(off.setController(controller, { from: attacker }));
  });

  it('owner can mint token', async () => {
    await off.mint(tokenId, true, uri, metadataHash, imageHash, { from: owner });
    (await off.ownerOf(tokenId)).should.be.equal(owner);
  });

  it('attacker can not mint token', async () => {
    await assertRevert(off.mint(tokenId, true, uri, metadataHash, imageHash, { from: attacker }));
  });

  it('minted token is set as for sale', async () => {
    await off.mint(tokenId, true, uri, metadataHash, imageHash, { from: owner });
    (await off.forSale(tokenId)).should.be.equal(true);
  });

  it('minted token is not set as for sale', async () => {
    await off.mint(tokenId, false, uri, metadataHash, imageHash, { from: owner });
    (await off.forSale(tokenId)).should.be.equal(false);
  });

  it('minted token has correct metadataHash', async () => {
    await off.mint(tokenId, true, uri, metadataHash, imageHash, { from: owner });
    (await off.metadataHash(tokenId)).should.be.equal(metadataHash);
  });

  it('minted token has correct imageHash', async () => {
    await off.mint(tokenId, true, uri, metadataHash, imageHash, { from: owner });
    (await off.imageHash(tokenId)).should.be.equal(imageHash);
  });

  it('minted token has correct uri', async () => {
    await off.mint(tokenId, false, uri, metadataHash, imageHash, { from: owner });
    (await off.tokenURI(tokenId)).should.be.equal(uri);
  });

  it('minted token can have any token id', async () => {
    const otherTokenId = 200;
    await off.mint(otherTokenId, false, uri, metadataHash, imageHash, { from: owner });
    (await off.ownerOf(otherTokenId)).should.be.equal(owner);
  });
});
