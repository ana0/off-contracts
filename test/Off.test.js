const {
  BN,
} = require('./helpers/constants');

const Off = artifacts.require('Off');

require('chai')
  .use(require('chai-bn')(BN))
  .should();

contract('Off', ([_, systemOwner, attacker, owner]) => { // eslint-disable-line no-unused-vars
  let off = null;

  beforeEach(async () => {
    off = await Off
      .new(
        { from: systemOwner },
      );
  });

  // it('should successfully birth a lifeform', async () => {
  //   const tokenId = 0;
  //   await lifeforms.birth(owner, tokenId, { from: owner });
  //   (await lifeforms.isAlive(tokenId)).should.be.equal(true);
  // });
});
