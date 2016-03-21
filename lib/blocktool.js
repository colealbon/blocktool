"use strict";
/*eslint-env node, es6*/
const memoizee = require('memoizee');
const retry = require("retry-bluebird");
const blockchainxd = require("bitcoin-promise");
const config = require(__dirname + '/../config/options.js');

const client = new blockchainxd.Client({
    host: config.blockchainxd_host,
    user: config.blockchainxd_rpc_user,
    pass: config.blockchainxd_rpc_pass,
    timeout: 60000
});

const slow_getBlockCount = function() {
    return retry({
        max: 5
    }, () => {
        return client.getBlockCount()
            .then((blockcount) => {
                intGuard(blockcount);
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

const intGuard = (x) => {
    numGuard(x);
    if (x !== parseInt(x, 10)) {
        throw new TypeError("expected integer but received " + x);
    }
};
