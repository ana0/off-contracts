const {
  BN,
  ZERO_ADDRESS,
  timestamp,
} = require('./helpers/constants');
const {
  assertRevert,
} = require('./helpers/assertRevert');

const Off = artifacts.require('Off');

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('Off', ([_, owner, attacker, sendingController, user]) => {
  let off = null;
  const tokenId = 0;
  const secretImageHash = 'QmbLnKaAsUbCXx3JYtMTkgXAeAUx2TN8diuy6qFhwN1zE5';
  const imageHash = 'QmRfQakyz9mmKJE8BMQTZMm9QAWsiRp9oroGcyeKFyANid';
  const uri = 'uri';
  const baseUri = 'http://url.com/';
  const signingController = web3.eth.accounts.create();
  let nonce = 0;

  const createAuthorization = (messageHash) => {
    nonce += 1;
    return web3.eth.accounts.sign(messageHash, signingController.privateKey).signature;
  };

  beforeEach(async () => {
    off = await Off.new('off', 'OFF', web3.utils.toWei('35'), { from: owner });
  });

  it('owner can set baseUri', async () => {
    await off.setBaseURI(baseUri, { from: owner });
    (await off.baseURI()).should.be.equal(baseUri);
  });

  it('attacker can not set baseUri', async () => {
    await assertRevert(off.setBaseURI(baseUri, { from: attacker }));
  });

  it('owner can set controller', async () => {
    await off.setController(sendingController, { from: owner });
    (await off.controller()).should.be.equal(sendingController);
  });

  it('attacker can not set controller', async () => {
    await assertRevert(off.setController(sendingController, { from: attacker }));
  });

  it('owner can mint token', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    (await off.ownerOf(tokenId)).should.be.equal(owner);
  });

  it('attacker can not mint token', async () => {
    await assertRevert(
      off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: attacker }),
    );
  });

  it('owner can update for sale status of token', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await off.setForSale(tokenId, false, { from: owner });
    (await off.forSale(tokenId)).should.be.equal(false);
  });

  it('owner can not update for sale status of unminted token', async () => {
    await assertRevert(
      off.setForSale(tokenId, false, { from: owner }),
    );
  });

  it('owner can not update for sale status of sold token', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await off.sell(tokenId, user, { from: owner });
    await assertRevert(
      off.setForSale(tokenId, false, { from: owner }),
    );
  });

  it('attacker can not update for sale status of token', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await assertRevert(
      off.setForSale(tokenId, false, { from: attacker }),
    );
  });

  it('minted token is set as for sale', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    (await off.forSale(tokenId)).should.be.equal(true);
  });

  it('minted token is not set as for sale', async () => {
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });
    (await off.forSale(tokenId)).should.be.equal(false);
  });

  it('minted token has correct secretImageHash', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    (await off.secretImageHash(tokenId)).should.be.equal(secretImageHash);
  });

  it('minted token has correct imageHash', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    (await off.imageHash(tokenId)).should.be.equal(imageHash);
  });

  it('minted token has correct uri', async () => {
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });
    (await off.tokenURI(tokenId)).should.be.equal(uri);
  });

  it('minted token can have any token id', async () => {
    const otherTokenId = 200;
    await off.mint(otherTokenId, false, uri, secretImageHash, imageHash, { from: owner });
    (await off.ownerOf(otherTokenId)).should.be.equal(owner);
  });

  it('token getter returns correct info', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    const token = await off.getToken(tokenId);
    token[0].should.be.equal(uri);
    token[1].should.be.equal(true);
    token[2].should.be.equal(secretImageHash);
    token[3].should.be.equal(imageHash);
    token[4].should.be.equal(owner);
  });

  it('token getter returns correct info when token is unminted', async () => {
    const token = await off.getToken(tokenId);
    token[0].should.be.equal('');
    token[1].should.be.equal(false);
    token[2].should.be.equal('');
    token[3].should.be.equal('');
    token[4].should.be.equal(ZERO_ADDRESS);
  });

  it('owner can sell minted token, if for sale', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await off.sell(tokenId, user, { from: owner });
    (await off.ownerOf(tokenId)).should.be.equal(user);
  });

  it('owner can not sell minted token, if not for sale', async () => {
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });
    await assertRevert(off.sell(tokenId, user, { from: owner }));
  });

  it('owner can not sell unminted token', async () => {
    await assertRevert(off.sell(tokenId, user, { from: owner }));
  });

  it('controller can sell minted token, if for sale and controller set', async () => {
    await off.setControllerCanSell(true, { from: owner });
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await off.setController(sendingController, { from: owner });
    await off.sell(tokenId, user, { from: sendingController });
    (await off.ownerOf(tokenId)).should.be.equal(user);
  });

  it('controller cant sell minted token without permissions', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await off.setController(sendingController, { from: owner });
    await assertRevert(off.sell(tokenId, user, { from: sendingController }));
  });

  it('controller can not sell minted token, if not for sale and controller set', async () => {
    await off.setControllerCanSell(true, { from: owner });
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });
    await off.setController(sendingController, { from: owner });
    await assertRevert(off.sell(tokenId, user, { from: sendingController }));
  });

  it('controller can not sell unminted token', async () => {
    await off.setControllerCanSell(true, { from: owner });
    await off.setController(sendingController, { from: owner });
    await assertRevert(off.sell(tokenId, user, { from: sendingController }));
  });

  it('attacker can not minted token, if for sale', async () => {
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    await assertRevert(off.sell(tokenId, user, { from: attacker }));
  });

  it('attacker can not sell minted token, if not for sale', async () => {
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });
    await assertRevert(off.sell(tokenId, user, { from: attacker }));
  });

  it('attacker can not sell unminted token', async () => {
    await assertRevert(off.sell(tokenId, user, { from: attacker }));
  });

  it('user can buy minted token, if for sale', async () => {
    await off.setController(signingController.address, { from: owner });
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });
    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('35') });
    (await off.ownerOf(tokenId)).should.be.equal(user);
  });

  it('user can not buy minted token, if not for sale', async () => {
    await off.setController(signingController.address, { from: owner });
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });

    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await assertRevert(off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('35') }));
  });

  it('user can not buy unminted token', async () => {
    await off.setController(signingController.address, { from: owner });

    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await assertRevert(off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('35') }));
  });

  it('user can not buy minted token, if for sale, when sending less than price', async () => {
    await off.setController(signingController.address, { from: owner });
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });

    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await assertRevert(off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('34') }));
  });

  it('user can not buy minted token, if not for sale, when sending less than price', async () => {
    await off.setController(signingController.address, { from: owner });
    await off.mint(tokenId, false, uri, secretImageHash, imageHash, { from: owner });

    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await assertRevert(off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('34') }));
  });

  it('user can not buy unminted token, when sending less than price', async () => {
    await off.setController(signingController.address, { from: owner });
    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await assertRevert(off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('34') }));
  });

  it('user buying token leaves eth in contract', async () => {
    await off.setController(signingController.address, { from: owner });
    await off.mint(tokenId, true, uri, secretImageHash, imageHash, { from: owner });

    const issuingTime = timestamp();
    const localNonce = nonce;
    const msg = await off.getMessageHash(user, tokenId, issuingTime, nonce);

    const auth = createAuthorization(msg);

    await off.buy(tokenId, user, issuingTime, localNonce, auth, { from: user, value: web3.utils.toWei('35') });
    (await web3.eth.getBalance(off.address)).should.be.equal(web3.utils.toWei('35'));
  });
});
