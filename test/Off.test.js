const {
  BN,
} = require('./helpers/constants');

const Off = artifacts.require('Off');

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('Off', ([_, owner, attacker, controller, user]) => { // eslint-disable-line no-unused-vars
  let off = null;

  beforeEach(async () => {
    off = await Off.new("off", "OFF", web3.utils.toWei('35'), { from: owner });
  });

  it('should successfully mint a token', async () => {
    const tokenId = 0;
    const metadataHash = "QmbLnKaAsUbCXx3JYtMTkgXAeAUx2TN8diuy6qFhwN1zE5";
    const imageHash = "QmRfQakyz9mmKJE8BMQTZMm9QAWsiRp9oroGcyeKFyANid";
    await off.mint(tokenId, true, "uri", metadataHash, imageHash, { from: owner });
    (await off.ownerOf(tokenId)).should.be.equal(owner);
  });
});
