'use strict';
/*eslint-env node, mocha, es6 */
/*jslint node: true */
process.env.NODE_ENV = 'test';

suite('blockchain-server:', function() {
    const config = require(__dirname + '/../config/options.js');
    const chai = require('chai');
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");

    chai.use(chaiAsPromised);

    const blockchainxd = require('bitcoin-promise');
    const client = new blockchainxd.Client({
        host: config.blockchainxd_host,
        user: config.blockchainxd_rpc_user,
        pass: config.blockchainxd_rpc_pass,
        timeout: 60000
    });

    test('blockchain rpc server is alive', (done) => {
        const version = client.getInfo();
        return expect(version.then((serverinfo) => {
            return serverinfo.version;
        })).to.eventually.be.above(110200 - 1).notify(done);
    });
});
