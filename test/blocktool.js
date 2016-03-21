'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const blocktool = require(process.cwd() + '/lib/blocktool.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

suite('blocktool:', () => {
    test('getblockcount (magic)', (done) => {
        return expect(blocktool.getBlockCount()).to.eventually.be
            .above(30827).notify(done);
    });
});
