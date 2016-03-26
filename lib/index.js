"use strict";
/*eslint-env node, es6*/
const memoizee = require('memoizee');
const Promise = require("bluebird");
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

const logger = new(winston.Logger)({
    transports: [new(winston.transports.File)({
        filename: config.winston_log_file
    })],
    level: config.winston_log_level
});

const slow_blockHashToBlockHeader = function(blockhash) {
    logger.silly({
        'slow_blockHashToBlockHeader': {
            'blockhash': blockhash
        }
    });
    str64Guard(blockhash);
    return retry({
        max: 5
    }, function() {
        return client.getBlock(blockhash)
            .then(function(blockheader) {
                blockHeaderGuard(blockheader);
                return blockheader;
            });
    });
};
const blockHashToBlockHeader = memoizee(slow_blockHashToBlockHeader);
module.exports.blockHashToBlockHeader = blockHashToBlockHeader;

const slow_blockCountToBlockhash = function(blockcount) {
    //adds a retry to bitcoin core's getBlockHash function
    logger.silly({
        'blockCountToBlockhash <-': {
            'blockcount': blockcount
        }
    });
    intGuard(blockcount);
    return retry({
        max: 5
    }, function() {
        return client.getBlockHash(blockcount).then(function(
            blockhash) {
            logger.silly({
                'slow_blockCountToBlockhash <->': {
                    'blockhash': blockhash
                }
            });
            str64Guard(blockhash);
            logger.silly({
                'slow_blockCountToBlockhash ->': {
                    'blockhash': blockhash
                }
            });
            return blockhash;
        });
    });
};
const blockCountToBlockhash = memoizee(slow_blockCountToBlockhash);
module.exports.blockCountToBlockhash = blockCountToBlockhash;

const slow_blockCountToTime = function(blockcount) {
    logger.silly({
        'slow_blockCountToTime <-': {
            'blockcount': blockcount
        }
    });
    intGuard(blockcount);
    return blockCountToBlockhash(blockcount)
        .then(blockHashToBlockHeader)
        .then(blockHeaderToTime).then(function(blocktime) {
            intGuard(blocktime);
            logger.silly({
                'slow_blockCountToTime ->': {
                    'blocktime': blocktime
                }
            });
            return blocktime;
        });
};
const blockCountToTime = memoizee(slow_blockCountToTime);
module.exports.blockCountToTime = blockCountToTime;

const slow_blockHeaderToTime = function(blockheader) {
    logger.silly({
        'slow_blockHeaderToTime <-': {
            'blockheader_hash': blockheader.hash
        }
    });
    blockHeaderGuard(blockheader);
    intGuard(blockheader.time);
    return blockheader.time;
};
const blockHeaderToTime = memoizee(slow_blockHeaderToTime);
module.exports.blockHeaderToTime = blockHeaderToTime;

const slow_getLatestBlockTime = function() {
    return getBlockCount()
        .then(blockCountToTime)
        .then(function(blocktime) {
            intGuard(blocktime);
            logger.silly({
                'slow_getLatestBlockTime -> ': {
                    'blocktime': blocktime
                }
            });
            return blocktime;
        });
};
const getLatestBlockTime = memoizee(slow_getLatestBlockTime, {
    maxAge: 1000
});
module.exports.getLatestBlockTime = getLatestBlockTime;

const slow_getBlockCount = function() {
    return retry({
        max: 5
    }, function() {
        return client.getBlockCount()
            .then(function(blockcount) {
                intGuard(blockcount);
                logger.silly({
                    'slow_getBlockCount -> ': {
                        'blockcount': blockcount
                    }
                });
                return blockcount;
            });
    });
};
const getBlockCount = memoizee(slow_getBlockCount, {
    maxAge: 1000
});
module.exports.getBlockCount = getBlockCount;

const slow_guess = function slow_guess(guessObj) {
    logger.silly({
        'slow_guess<-': {
            'guessObj': guessObj
        }
    });
    guessGuard(guessObj);
    guessObj.lowtime = guessObj.lowtime || blockCountToTime(
        guessObj.lowcount);
    guessObj.hightime = guessObj.hightime ||
        blockCountToTime(guessObj.highcount);
    guessObj.guesscount =
        parseInt(guessObj.highcount - ((guessObj.highcount -
            guessObj.lowcount) / 2));

    return Promise.join(
        guessObj,
        function(guessObj) {
            return blockCountToTime(guessObj.guesscount)
                .then(function quitOrGuessAgain(guesstime) {
                    logger.silly({
                        'quitOrGuessAgain<->': {
                            'guesstime': guesstime
                        }
                    });
                    if ((guessObj.highcount - guessObj.lowcount) <
                        2) {
                        return (guesstime >= guessObj.targettime) ?
                            guessObj.lowcount :
                            guessObj.highcount;
                    } else {
                        return (guesstime > guessObj.targettime) ?
                            guess({
                                'lowcount': guessObj.lowcount,
                                'highcount': guessObj.guesscount,
                                'targettime': guessObj.targettime,
                                'lowtime': guessObj.lowtime,
                                'hightime': guesstime
                            }) :
                            guess({
                                'lowcount': guessObj.guesscount,
                                'highcount': guessObj.highcount,
                                'targettime': guessObj.targettime,
                                'lowtime': guesstime,
                                'hightime': guessObj.hightime
                            });
                        // guesscount is swapped with either hi or low to reduce
                    }
                });
        });
};

const guess = memoizee(slow_guess);
module.exports.guess = guess;

const slow_timeToBlockCount = function(targettime) {
    logger.silly({
        'slow_timeToBlockCount <-': {
            'targettime': targettime
        }
    });
    intGuard(targettime);
    return client.getBlockCount()
        .then(function(highcount) {
            logger.silly({
                'slow_timeToBlockCount': {
                    'lowcount': 1,
                    'highcount': highcount,
                    'targettime': targettime
                }
            });
            return guess({
                'lowcount': 1,
                'highcount': highcount,
                'targettime': targettime
            });
        })
        .then(function(guesscount) {
            intGuard(guesscount);
            logger.silly({
                'slow_timeToBlockCount ->': {
                    'guesscount': guesscount
                }
            });
            return guesscount;
        });
};
const timeToBlockCount = memoizee(slow_timeToBlockCount);
module.exports.timeToBlockCount = timeToBlockCount;

const typeOf = function(type) {
    const typex = type.toString();
    return function(x) {
        if (typeof x !== typex) {
            throw new TypeError(
                "expected " + typex +
                " but received " + typeof(typex) + ": " + x
            );
        }
    };
};

const slow_txidToRawTransaction = function(txid) {
    //adds a retry to bitcoin core"s getrawtransaction(txid, verbose);
    logger.silly({
        "txidToRawTransaction <-": {
            "txid": txid
        }
    });
    str64Guard(txid);
    return retry({
        max: 50
    }, function() {
        return client.getRawTransaction(txid, 1)
            .then(function(rawtransaction) {
                rawTransactionGuard(rawtransaction);
                logger.silly({
                    'txidToRawTransaction -> ': rawtransaction
                });
                return rawtransaction;
            });
    });
};
const txidToRawTransaction = memoizee(slow_txidToRawTransaction);
module.exports.txidToRawTransaction = txidToRawTransaction;

const slow_txidToTransactionSignature = function(txid) {
    //append input source info to a transaction (needed for days destroyed calc)
    logger.debug({
        "txidToTransactionSignature <-": {
            "txid": txid
        }
    });
    str64Guard(txid);
    return txidToRawTransaction(txid).then(function(rawtransaction) {
        const transactionsignature = Object.assign(rawtransaction);
        const inputdetail = Promise.all(
            rawTransactionToInputDetail(rawtransaction)).then(
            function(
                inputdetail) {
                return inputdetail;
            });
        return Promise.join(transactionsignature, inputdetail,
            function(
                transactionsignature, inputdetail) {
                transactionsignature.inputdetail = inputdetail;
                return transactionsignature;
            });
    });
};
const txidToTransactionSignature = memoizee(
    slow_txidToTransactionSignature);
module.exports.txidToTransactionSignature = txidToTransactionSignature;

const voutItemGuard = function(voutitem) {
    logger.silly({
        'voutitem <- voutitem': voutitem
    });
    objGuard(voutitem);
    const voutItemLense = lenses.Lens.objectLens,
        value = voutItemLense('value').run(voutitem).get(),
        n = voutItemLense('n').run(voutitem).get();
    numGuard(value);
    intGuard(n);
};
module.exports.voutItemGuard = voutItemGuard;

const slow_txidToVout = function(txid) {
    logger.silly({
        'txidToVout <- txid': txid
    });
    return txidToRawTransaction(txid)
        .then(function(rawtransaction) {
            logger.silly({
                'txidToVout <-> rawtransaction': rawtransaction
                    .txid
            });
            return rawtransaction.vout.map(function(voutItem) {
                voutItem.destroy_start = rawtransaction
                    .time;
                voutItem.txid = rawtransaction.txid;
                logger.silly({
                    'txidToVout -> voutDetail': voutItem
                });
                voutItemGuard(voutItem);
                return voutItem;
            });
        });
};
const txidToVout = memoizee(slow_txidToVout);
module.exports.txidToVout = txidToVout;

const slow_vinItemToInputDetailItem = function(vinItem) {
    logger.silly({
        'vinItemToInputDetailItem <- vinItem': vinItem
    });
    vinItemGuard(vinItem);
    return txidToVout(vinItem.txid)
        .then(function(vout) {
            logger.silly({
                'vinItemToInputDetailItem <-> vout': vout
            });
            return vout.map(function(voutitem) {
                if (voutitem.n === vinItem.vout) {
                    logger.silly({
                        'vinItemToInputDetailItem -> voutitem': voutitem
                    });
                    voutItemGuard(voutitem);
                    return voutitem;
                }
            }).filter(function(inputdetailitem) {
                return (inputdetailitem !== undefined);
            });
        });
};
const vinItemToInputDetailItem = memoizee(slow_vinItemToInputDetailItem);
module.exports.vinItemToInputDetailItem = vinItemToInputDetailItem;

const inputdetailGuard = function(inputdetail) {
    logger.debug({
        'inputdetailGuard <- inputdetail': inputdetail
    });
    // get the source output value and time
    // of each input (these things are used for days_destroyed calculation)
    vinGuard(vin);
    return vin.map(function(vinitem) {
        return vinItemToInputDetailItem(vinitem)
            .map(function(inputdetailitem) {
                inputdetailItemGuard(inputdetailitem);
                return inputdetailitem;
            }).reduce(function(a, b) {
                return a.concat(b);
            });
    });
};

const slow_vinToInputDetail = function(vin) {
    logger.silly({
        'vinToInputDetail <- vin': vin
    });
    // get the source output value and time
    // of each input (these things are used for days_destroyed calculation)
    vinGuard(vin);
    return vin.map(function(vinitem) {
        return vinItemToInputDetailItem(vinitem)
            .map(function(inputdetailitem) {
                inputdetailItemGuard(inputdetailitem);
                return inputdetailitem;
            }).reduce(function(a, b) {
                return a.concat(b);
            });
    });
};

const vinToInputDetail = slow_vinToInputDetail;
module.exports.vinToInputDetail =
    vinToInputDetail;

const slow_rawTransactionToInputDetail = function(
    rawtransaction) {
    logger.silly({
        'rawTransactionToInputDetail <- txid': rawtransaction
            .txid
    });
    rawTransactionGuard(rawtransaction);
    return vinToInputDetail(rawtransaction.vin);
};

const rawTransactionToInputDetail = memoizee(
    slow_rawTransactionToInputDetail);
module.exports.rawTransactionToInputDetail =
    rawTransactionToInputDetail;

const slow_rawTransactionToTransactionSignature = function(
    rawtransaction, callback) {
    logger.silly({
        'rawTransactionToTransactionSignature <-': {
            'rawtransaction': rawtransaction
        }
    });
    rawTransactionGuard(rawtransaction);
    const transactionsignature = Object.assign(rawtransaction);
    // const inputdetail = Promise.all(rawTransactionToInputDetail(
    //     rawtransaction));
    // return Promise.join(transactionsignature, inputdetail, function(
    //     transactionsignature, inputdetail) {
    //     transactionsignature.inputdetail = inputdetail;
    //     return callback(transactionsignature);
    // });
};
const rawTransactionToTransactionSignature =
    slow_rawTransactionToTransactionSignature;
module.exports.rawTransactionToTransactionSignature =
    rawTransactionToTransactionSignature;


const arrGuard = function(a) {
    if (Object.prototype.toString.call(a) !==
        '[object Array]') {
        throw new TypeError(
            "expected Array but received " +
            typeof(
                a));
    }
};

const arrOf = function(c) {
    return function(a) {
        arrGuard(a);
        return a.map(c);
    };
};

const numGuard = typeOf("number");

const intGuard = function(x) {
    logger.silly({
        'intGuard<-': {
            'x': x
        }
    });
    numGuard(x);
    if (x !== parseInt(x, 10)) {
        throw new TypeError(
            "expected integer but received " + x);
    }
};

const objGuard = typeOf("object");
const strGuard = typeOf("string");
const undefGuard = typeOf("undefined");
//const bool = typeOf("boolean");
//const func = typeOf("function");

const str64Guard = function(x) {
    strGuard(x);
    if (x.length !== 64) {
        throw new TypeError(
            "expected 64 character string but received " +
            x);
    }
};

const blockHeaderGuard = function(blockheader) {
    objGuard(blockheader);
    const blockHeaderLense = lenses.Lens.objectLens,
        o = void intGuard(blockHeaderLense('time').run(
                blockheader)
            .get());
    return o;
};

const guessGuard = function(guessObj) {
    logger.silly({
        'guessGuard <-': {
            'guessObj': guessObj
        }
    });
    objGuard(guessObj);
    const guessLense = lenses.Lens.objectLens,
        lowcount = guessLense('lowcount').run(guessObj)
        .get(),
        highcount = guessLense('highcount').run(
            guessObj).get(),
        targettime = guessLense('targettime').run(
            guessObj)
        .get();
    intGuard(lowcount);
    intGuard(highcount);
    intGuard(targettime);
};

const vinGuard = function(vin) {
    logger.silly({
        'vinGuard <- vin': vin
    });
    arrOfVinItemGuard(vin);
};

const vinItemGuard = function(vinitem) {
    logger.silly({
        'vinItemGuard <-': {
            'vinitem': vinitem
        }
    });
    objGuard(vinitem);
    const vinItemLense = lenses.Lens.objectLens,
        txid = vinItemLense('txid').run(vinitem).get(),
        coinbase = vinItemLense('coinbase').run(vinitem)
        .get(),
        vout = vinItemLense('vout').run(vinitem).get();
    try {
        undefGuard(txid);
        strGuard(coinbase);
    } catch (TypeError) {
        str64Guard(txid);
        intGuard(vout);
    }
};

const arrOfVinItemGuard = arrOf(vinItemGuard);

const inputdetailItemGuard = function(inputdetailItem) {
    logger.silly({
        'inputdetailItemGuard <-': {
            'inputdetailItem': inputdetailItem
        }
    });
    objGuard(inputdetailItem);
    const inputdetailItemLense = lenses.Lens.objectLens,
        value = inputdetailItemLense('value').run(
            inputdetailItem).get(),
        n = inputdetailItemLense('n').run(
            inputdetailItem).get(),
        txid = inputdetailItemLense('txid').run(
            inputdetailItem).get(),
        destroy_start = inputdetailItemLense(
            'destroy_start').run(
            inputdetailItem).get();
    if (txid !== undefined) {
        numGuard(value);
        intGuard(n);
        str64Guard(txid);
        intGuard(destroy_start);
    }
};
const rawTransactionGuard = function rawTransactionGuard(
    rawtransaction) {
    logger.silly({
        'rawTransactionGuard <- ': {
            'rawtransaction': rawtransaction
        }
    });
    objGuard(rawtransaction);
    const rawTransactionLense = lenses.Lens.objectLens,
        txid = rawTransactionLense('txid').run(
            rawtransaction).get(),
        blocktime = rawTransactionLense('time').run(
            rawtransaction)
        .get(),
        vin = rawTransactionLense('vin').run(
            rawtransaction)
        .get();
    str64Guard(txid);
    intGuard(blocktime);
    vinGuard(vin);
};
const transactionSignatureGuard = function transactionSignatureGuard(
    transactionsignature) {
    logger.silly({
        'transactionSignatureGuard <- ': {
            'transactionsignature': transactionsignature
        }
    });
    rawTransactionGuard(transactionsignature);
    const transactionSignatureLense = lenses.Lens.objectLens,
        txid = transactionSignatureLense('txid').run(
            transactionsignature).get(),
        inputdetail = transactionSignatureLense('inputdetail').run(
            transactionsignature)
        .get();
    str64Guard(txid);
    inputdetailGuard(inputdetail);
};
