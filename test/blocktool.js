'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
const blocktool = require(process.cwd() + '/lib/index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

suite('blocktool:', function() {
    test('getblockcount (magic)', function(done) {
        return expect(blocktool.getBlockCount()).to.eventually.be
            .above(30827).notify(done);
    });
    test('getblocktime (magic)', function(done) {
        return expect(blocktool.getLatestBlockTime()).to.eventually
            .be
            .above(1458534660).notify(done);
    });
    test('blockhashGuard throws error if length not 64', function(done) {
        expect(function() {
            const testblockhash =
                '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac725';
            return blocktool.blockhashGuard(
                testblockhash);
        }).to.throw(Error);
        done();
    });
    test('blockcountToBlockhash (magic)', function() {
        const blockcount = 300000;
        const blockhash = blocktool.blockCountToBlockhash(
            blockcount);
        return expect(blockhash).to.eventually.equal(
            '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254'
        );
    });
    test(
        'blockcountToBlockhash throws error on receiving string blockcount',
        function(done) {
            expect(function() {
                const blockcount = "1";
                return blocktool.blockCountToBlockhash(
                    blockcount);
            }).to.throw(TypeError);
            done();
        });

    test('guess', function(done) {
        const highcount = 3;
        const lowcount = 1;
        const targettime = 1231469744;
        const lowtime = 1231469665;
        const hightime = 1231470173;
        const guess = blocktool.guess({
            'lowcount': lowcount,
            'highcount': highcount,
            'targettime': targettime,
            'lowtime': lowtime,
            'hightime': hightime
        });
        return expect(guess).to.eventually.equal(2).notify(done);
    });
    test('guess throws error on receiving string for high', function(
        done) {
        expect(function() {
            const highcount = "3";
            const lowcount = 1;
            const targettime = 1231469744;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            void blocktool.guess({
                'lowcount': lowcount,
                'highcount': highcount,
                'targettime': targettime,
                'lowtime': lowtime,
                'hightime': hightime
            });
        }).to.throw(TypeError);
        done();
    });
    test('guess throws error on receiving string for low', function(
        done) {
        expect(function() {
            const highcount = 3;
            const lowcount = "1";
            const targettime = 1231469744;
            const lowtime = 1231469665;
            const hightime = 1231470173;
            void blocktool.guess({
                'lowcount': lowcount,
                'highcount': highcount,
                'targettime': targettime,
                'lowtime': lowtime,
                'hightime': hightime
            });
        }).to.throw(TypeError);
        done();
    });
    test('guess throws error on receiving string for targettime',
        function(done) {
            expect(function() {
                const highcount = 3;
                const lowcount = 1;
                const targettime = "1231469744";
                const lowtime = 1231469665;
                const hightime = 1231470173;
                void blocktool.guess({
                    'lowcount': lowcount,
                    'highcount': highcount,
                    'targettime': targettime,
                    'lowtime': lowtime,
                    'hightime': hightime
                });
            }).to.throw(TypeError);
            done();
        });
    test('timeToBlockCount (post-apocalypse)', (done) => {
        const targettime = 9999999999;
        const blockcount = blocktool.timeToBlockCount(
            targettime);
        return expect(blockcount).to.eventually.be.above(363312)
            .notify(done);
    });
    test('timeToBlockCount (pre-satoshi)', (done) => {
        const targettime = 100;
        const blockcount = blocktool.timeToBlockCount(
            targettime);
        return expect(blockcount).to.eventually.equal(1).notify(
            done);
    });
    test('timeToBlockCount (targettime == blocktime)', (done) => {
        this.timeout(1200000);
        const targettime = 1438656758;
        const blockcount = blocktool.timeToBlockCount(
            targettime);
        return expect(blockcount).to.eventually.equal(368329).notify(
            done);
    });
    test('timeToBlockCount (targettime != blocktime)', (done) => {
        const targettime = 1438656757;
        const blockcount = blocktool.timeToBlockCount(
            targettime);
        return expect(blockcount).to.eventually.equal(368329).notify(
            done);
    });
    test(
        'timeToBlockCount throws error on receiving string for targettime', (
            done) => {
            expect(function() {
                const targettime = "1438656757";
                return blocktool.timeToBlockCount(
                    targettime);
            }).to.throw(TypeError);
            done();
        });



});
