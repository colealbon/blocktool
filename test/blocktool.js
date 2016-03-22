'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const blocktool = require(process.cwd() + '/lib/blocktool.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

suite('blocktool:', function () {
    test('getblockcount (magic)', function (done) {
        return expect(blocktool.getBlockCount()).to.eventually.be
            .above(30827).notify(done);
    });
    test('getblocktime (magic)', function (done) {
        return expect(blocktool.getLatestBlockTime()).to.eventually.be
            .above(1458534660).notify(done);
    });
    test('blockhashGuard throws error if length not 64', function (done) {
      expect(function() {
          let testblockhash = '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac725'
          return blocktool.blockhashGuard(testblockhash);
          }).to.throw(Error);
          done();
      });
    test('blockcountToBlockhash (magic)', function () {
      let blockcount = 300000;
      var blockhash = blocktool.blockCountToBlockhash(blockcount);
      return expect(blockhash).to.eventually.equal('000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254');
      });

    test('blockcountToBlockhash throws error on receiving string blockcount', function (done) {
        expect(function() {
            let blockcount = "1";
            return blocktool.blockCountToBlockhash(blockcount);
          }).to.throw(TypeError);
          done();
      });
});
