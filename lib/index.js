"use strict";
/*eslint-env node, es6*/
const memoizee = require('memoizee');
const retry = require("retry-bluebird");
const blockchainxd = require("bitcoin-promise");
const config = require(__dirname + '/../config/options.js');
const winston = require('winston');
const lenses = require('fantasy-lenses');

const client = new blockchainxd.Client({
    host: config.blockchainxd_host,
    user: config.blockchainxd_rpc_user,
    pass: config.blockchainxd_rpc_pass,
    timeout: 60000
});

const logger = new(winston.Logger) ({
    transports: [new(winston.transports.File)({filename: config.winston_log_file })],
    level: config.winston_log_level
    });

const slow_blockHashToBlockHeader = function (blockhash) {
    logger.silly({'slow_blockHashToBlockHeader': {'blockhash': blockhash}});
    str64Guard(blockhash);
    return retry({max: 5}, function () {
        return client.getBlock(blockhash)
        .then(function(blockheader) {
            blockHeaderGuard(blockheader);
            return blockheader;
            });
        });
    };
const blockHashToBlockHeader = memoizee(slow_blockHashToBlockHeader);
module.exports.blockHashToBlockHeader = blockHashToBlockHeader;

const slow_blockCountToBlockhash = function (blockcount) {
    //adds a retry to bitcoin core's getBlockHash function
    logger.debug({'blockCountToBlockhash <-': {'blockcount': blockcount}});
    intGuard(blockcount);
    return retry({max: 5}, function() {
        return client.getBlockHash(blockcount).then(function(blockhash) {
            logger.debug({'slow_blockCountToBlockhash <->': {'blockhash': blockhash}});
            str64Guard(blockhash);
            logger.debug({'slow_blockCountToBlockhash ->': {'blockhash': blockhash}});
            return blockhash;
            });
        });
    };
const blockCountToBlockhash = memoizee(slow_blockCountToBlockhash);
module.exports.blockCountToBlockhash = blockCountToBlockhash;

const slow_blockCountToTime = function (blockcount) {
    logger.debug({'slow_blockCountToTime <-': {'blockcount': blockcount}});
    intGuard(blockcount);
    return blockCountToBlockhash(blockcount)
        .then(blockHashToBlockHeader)
        .then(blockHeaderToTime).then(function(blocktime) {
            intGuard(blocktime);
            logger.debug({'slow_blockCountToTime ->': {'blocktime': blocktime}});
            return blocktime;
        });
    };
const blockCountToTime = memoizee(slow_blockCountToTime);
module.exports.blockCountToTime = blockCountToTime;

const slow_blockHeaderToTime = function (blockheader) {
    logger.debug({'slow_blockHeaderToTime <-': {'blockheader_hash': blockheader.hash}});
    blockHeaderGuard(blockheader);
    intGuard(blockheader.time);
    return blockheader.time;
    };
const blockHeaderToTime = memoizee(slow_blockHeaderToTime);
module.exports.blockblockHeaderToTime = blockHeaderToTime;

const slow_getLatestBlockTime = function () {
    return getBlockCount()
    .then(blockCountToTime)
    .then(function(blocktime) {
        intGuard(blocktime);
        logger.debug({'slow_getLatestBlockTime -> ': {'blocktime': blocktime}});
        return blocktime;
        });
    };
const getLatestBlockTime = memoizee(slow_getLatestBlockTime, {maxAge: 1000});
module.exports.getLatestBlockTime = getLatestBlockTime;

const slow_getBlockCount = function() {
    return retry({
        max: 5
    }, function () {
        return client.getBlockCount()
            .then(function (blockcount) {
                intGuard(blockcount);
                logger.debug({'slow_getBlockCount -> ': {'blockcount': blockcount}});
                return blockcount;
            });
    });
};
const getBlockCount = memoizee(slow_getBlockCount, {
    maxAge: 1000
});
module.exports.getBlockCount = getBlockCount;

const typeOf = function(type) {
    const typex = type.toString();
    return function(x) {
        if (typeof x !== typex) {
            throw new TypeError(
                "expected " + typex +
                " but received " + typeof(typex) + ": " + x);
        }
    };
};

const numGuard = typeOf("number");

const intGuard = function (x) {
    numGuard(x);
    if (x !== parseInt(x, 10)) {
        throw new TypeError("expected integer but received " + x);
    }
};

const objGuard = typeOf("object");
const strGuard = typeOf("string");
//const bool = typeOf("boolean");
//const undef = typeOf("undefined");
//const func = typeOf("function");

const str64Guard = function (x) {
    strGuard(x);
    if (x.length !== 64) {
        throw new TypeError("expected 64 character string but received " + x);
        }
    };

const blockHeaderGuard = function (blockheader) {
    objGuard(blockheader);
    const blockHeaderLense = lenses.Lens.objectLens,
    o = void intGuard(blockHeaderLense('time').run(blockheader).get());
    return o;
    };
