"use strict";
/*eslint-env node, es6*/
const memoizee = require('memoizee');
const memProfile = require('memoizee/profile');
const Promise = require("bluebird");
const retry = require("retry-bluebird");
const blockchainxd = require("bitcoin-promise");
const config = require(__dirname + '/../config/options.js');
const typecheck = require(__dirname + '/typecheck.js');
const winston = require('winston');
const assign = require('object-assign');

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

module.exports.statistics = memProfile.statistics;

const slow_getBlockCount = function getBlockCount() {
    logger.debug(
        'slow_getBlockCount');
    return retry({
        max: 5
    }, function() {
        return client.getBlockCount()
            .then(function(blockcount) {
                //typecheck.intGuard(blockcount);
                logger.debug({
                    'slow_getBlockCount -> ': {
                        'blockcount': blockcount
                    }
                });
                //logger.debug(blockcount)
                return blockcount;
            });
    });
};
const getBlockCount = memoizee(slow_getBlockCount, {
    maxAge: 1000,
    resolvers: [Number],
    length: 1,
    primitive: true,
    max: 1
});
module.exports.getBlockCount = getBlockCount;

const blockRangeToBlockCount = function blockRangeToBlockCount(blockrange) {
    return Promise.resolve(blockrange).then(function(blockrange) {
        logger.silly({
            'blockRangeToBlockCount <-': {
                'blockrange': blockrange
            }
        });
        typecheck.blockRangeGuard(blockrange);
        const blockCountArr = [];
        let blockcount = blockrange.blockcountlow - 1;
        while (blockcount < blockrange.blockcounthigh) {
            logger.silly(blockcount);
            blockcount = blockcount + 1;
            blockCountArr.push(blockcount);
        }
        if (blockcount === blockrange.blockcounthigh) {
            logger.silly({
                'blockRangeToBlockCount ->': {
                    'blockCountArr': blockCountArr
                }
            });
            typecheck.arrOfIntGuard(blockCountArr);
            return blockCountArr;
        }
    });
};
module.exports.blockRangeToBlockCount = blockRangeToBlockCount;

const dateRangeToBlockCount = function* dateRangeToBlockCount(daterange) {
    logger.debug('dateRangeToBlockCount <-', {
        'daterange': daterange
    });
    typecheck.dateRangeGuard(daterange);
    return dateRangeToBlockRange(daterange).then(function(
        blockrange) {
        return blockRangeToBlockCount(blockrange);
    });
};
module.exports.dateRangeToBlockCount = dateRangeToBlockCount;

const dateRangeToBlockHash = function dateRangeToBlockHash(daterange) {
    logger.debug('dateRangeToBlockHash <-', {
        'daterange': daterange
    });
    typecheck.dateRangeGuard(daterange);
    return dateRangeToBlockRange(daterange).then(function(
        blockrange) {
        return blockRangeToBlockCount(blockrange)
            .map(function(blockcount) {
                return blockCountToBlockhash(blockcount);
            });
    });
};
module.exports.dateRangeToBlockHash = dateRangeToBlockHash;

const slow_dateRangeToTxid = function dateRangeToTxid(daterange) {
    logger.debug('dateRangeToTxi <-', {
        'daterange': daterange
    });
    typecheck.dateRangeGuard(daterange);
    return dateRangeToBlockRange(daterange).then(function(
        blockrange) {
        return blockRangeToBlockCount(blockrange)
            .map(function(blockcount) {
                return blockCountToBlockhash(blockcount);
            })
            .map(function(blockhash) {
                return blockHashToTxid(blockhash);
            });
    });
};
const dateRangeToTxid = memoizee(slow_dateRangeToTxid);
module.exports.dateRangeToTxid = dateRangeToTxid;

const slow_blockHashToTxid = function blockHashToTxid(blockhash) {
    logger.silly({
        'blockHashToTxid': {
            'blockhash<-': blockhash
        }
    });
    typecheck.str64Guard(blockhash);
    return retry({
        max: 5
    }, function() {
        return client.getBlock(blockhash)
            .then(function(blockheader) {
                typecheck.arrOfStr64Guard(blockheader.tx);
                logger.silly({
                    'blockHashToTxid -> ': blockheader.tx
                });
                return blockheader.tx;
            });
    });
};
const blockHashToTxid = memoizee(slow_blockHashToTxid);
module.exports.blockHashToTxid = blockHashToTxid;

const dateRangeToBlockRange = function dateRangeToBlockRange(
    daterange) {
    logger.debug({
        'dateRangeToBlockRange <-': {
            'daterange': daterange
        }
    });
    const starttime = daterange.starttime;
    const endtime = daterange.endtime;
    typecheck.dateRangeGuard({
        'starttime': starttime,
        'endtime': endtime
    });
    return Promise.props({
            blockcountlow: timeToBlockCount(starttime),
            blockcounthigh: timeToBlockCount(endtime)
        })
        .then(function(blockrange) {
            logger.debug({
                'dateRangeToBlockRange->': {
                    'blockrange': blockrange
                }
            });
            typecheck.blockRangeGuard(blockrange);
            return blockrange;
        });
};
module.exports.dateRangeToBlockRange = dateRangeToBlockRange;

const blockHashToBlockHeader = function blockHashToBlockHeader(blockhash) {
    logger.silly({
        'slow_blockHashToBlockHeader': {
            'blockhash': blockhash
        }
    });
    typecheck.str64Guard(blockhash);
    return retry({
        max: 5
    }, function() {
        return client.getBlock(blockhash)
            .then(function(blockheader) {
                logger.silly({
                    'slow_blockHashToBlockHeader->': {
                        'blockhash': blockheader
                            .hash
                    }
                });
                typecheck.blockHeaderGuard(
                    blockheader);
                return blockheader;
            });
    });
};
module.exports.blockHashToBlockHeader =
    blockHashToBlockHeader;

const slow_blockCountToBlockhash = function blockCountToBlockhash(blockcount) {
    //adds a retry to bitcoin core's getBlockHash function
    logger.silly({
        'blockCountToBlockhash <-': {
            'blockcount': blockcount
        }
    });
    typecheck.intGuard(blockcount);
    return retry({
        max: 5
    }, function() {
        return client.getBlockHash(blockcount).then(
            function(
                blockhash) {
                logger.silly({
                    'slow_blockCountToBlockhash <->': {
                        'blockhash': blockhash
                    }
                });
                typecheck.str64Guard(blockhash);
                logger.silly({
                    'slow_blockCountToBlockhash ->': {
                        'blockhash': blockhash
                    }
                });
                return blockhash;
            });
    });
};
const blockCountToBlockhash = memoizee(
    slow_blockCountToBlockhash);
module.exports.blockCountToBlockhash =
    blockCountToBlockhash;

const slow_blockCountToTime = function blockCountToTime(blockcount) {
    logger.debug({
        'slow_blockCountToTime <-': {
            'blockcount': blockcount
        }
    });
    typecheck.intGuard(blockcount);
    return blockCountToBlockhash(blockcount)
        .then(blockHashToBlockHeader)
        .then(blockHeaderToTime).then(function(blocktime) {
            typecheck.intGuard(blocktime);
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

const blockHeaderToTime = function blockHeaderToTime(blockheader) {
    logger.silly({
        'slow_blockHeaderToTime <-': {
            'blockheader_hash': blockheader.hash
        }
    });
    typecheck.blockHeaderGuard(blockheader);
    typecheck.intGuard(blockheader.time);
    return blockheader.time;
};
module.exports.blockHeaderToTime = blockHeaderToTime;

const slow_getLatestBlockTime = function getLatestBlockTime() {
    return getBlockCount()
        .then(blockCountToTime)
        .then(function(blocktime) {
            typecheck.intGuard(blocktime);
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

const guess = function guess(guessObj) {
    logger.silly({
        'slow_guess<-': {
            'guessObj': guessObj
        }
    });
    typecheck.guessGuard(guessObj);
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
                .then(function quitOrGuessAgain(
                    guesstime) {
                    logger.silly({
                        'quitOrGuessAgain<->': {
                            'guesstime': guesstime
                        }
                    });
                    if ((guessObj.highcount -
                            guessObj.lowcount) <
                        2) {
                        logger.silly({
                            'blockCountToTime->': {
                                'guessObj': guessObj
                            }
                        });
                        return (guesstime >=
                                guessObj.targettime
                            ) ?
                            guessObj.lowcount :
                            guessObj.highcount;
                    } else {
                        return (guesstime >
                                guessObj.targettime
                            ) ?
                            guess({
                                'lowcount': guessObj
                                    .lowcount,
                                'highcount': guessObj
                                    .guesscount,
                                'targettime': guessObj
                                    .targettime,
                                'lowtime': guessObj
                                    .lowtime,
                                'hightime': guesstime
                            }) :
                            guess({
                                'lowcount': guessObj
                                    .guesscount,
                                'highcount': guessObj
                                    .highcount,
                                'targettime': guessObj
                                    .targettime,
                                'lowtime': guesstime,
                                'hightime': guessObj
                                    .hightime
                            });
                        // What? guesscount is swapped with either hi or low
                    }
                });
        });
};

module.exports.guess =
    guess;

const timeToBlockCount = function timeToBlockCount(targettime) {
    logger.debug({
        'slow_timeToBlockCount <-': {
            'targettime': targettime
        }
    });
    typecheck.intGuard(targettime);
    return retry({
        max: 50
    }, function() {
        return client.getBlockCount()
            .then(function(highcount) {
                logger.silly({
                    'slow_timeToBlockCount<->': {
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
                logger.debug({
                    'slow_timeToBlockCount->': {
                        'guesscount': guesscount
                    }
                });
                typecheck.intGuard(guesscount);
                return guesscount;
            });
    });
};

module
    .exports.timeToBlockCount = timeToBlockCount;

const txidToRawTransaction = function txidToRawTransaction(txid) {
    //adds a retry to bitcoin core"s getrawtransaction(txid, verbose);
    logger.debug({
        "txidToRawTransaction <-": {
            "txid": txid
        }
    });
    //typecheck.str67Guard(txid);
    return retry({
        max: 50
    }, function() {
        return client.getRawTransaction(txid, 1)
            .then(function(rawtransaction) {
                logger.debug({
                    'txidToRawTransaction<->': {
                        'txid': rawtransaction.txid
                    }
                });
                typecheck.rawTransactionGuard(
                    rawtransaction);
                logger.debug({
                    'txidToRawTransaction -> ': rawtransaction
                });
                return rawtransaction;
            });
    });
};
module
    .exports.txidToRawTransaction = txidToRawTransaction;

const txidToTransactionSignature = function txidToTransactionSignature(
    txid) {
    //append input source info to a transaction (needed for days destroyed calc)
    logger.debug({
        "txidToTransactionSignature <-": {
            "txid": txid
        }
    });
    //typecheck.str67Guard(txid);
    return txidToRawTransaction(txid).then(function(
        rawtransaction) {
        //microservice rawtransaction
        return rawTransactionToTransactionSignature(
            rawtransaction).then(function(
            transactionsignature) {
            logger.debug({
                'txidToRawTransaction->': {
                    'transactionsignature_txid': transactionsignature
                        .txid
                }
            });
            typecheck.transactionSignatureGuard(
                transactionsignature);
            return transactionsignature;
        });
    });
};
module.exports.txidToTransactionSignature =
    txidToTransactionSignature;

const slow_txidToVout = function txidToVout(txid) {
    logger.silly({
        'txidToVout <- txid': txid
    });
    if (txid === undefined) {
        return;
    } else {
        return txidToRawTransaction(txid)
            .then(function(rawtransaction) {
                logger.silly({
                    'txidToVout <-> rawtransaction': rawtransaction
                        .txid
                });
                return rawtransaction.vout.map(function(
                    voutItem) {
                    voutItem.destroy_start =
                        rawtransaction
                        .time;
                    voutItem.txid = rawtransaction.txid;
                    logger.silly({
                        'txidToVout -> voutDetail': voutItem
                    });
                    typecheck.voutItemGuard(
                        voutItem);
                    return voutItem;
                });
            });
    }
};
const txidToVout = memoizee(
    slow_txidToVout, {
        maxAge: 60000
    });
module.exports.txidToVout = txidToVout;

const vinItemToInputDetailItem = function vinItemToInputDetailItem(vinItem) {
    logger.silly({
        'vinItemToInputDetailItem <- vinItem': vinItem
    });
    if (vinItem.txid === undefined) {
        return;
    } else {
        typecheck.vinItemGuard(vinItem);
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
                        typecheck.voutItemGuard(
                            voutitem);
                        return voutitem;
                    }
                }, {
                    concurrency: 1
                }).filter(function(inputdetailitem) {
                    return (inputdetailitem !==
                        undefined);
                });
            });
    }
};
module.exports.vinItemToInputDetailItem =
    vinItemToInputDetailItem;

const vinToInputDetail = function vinToInputDetail(vin) {
    // fix this to be more like arrayOf
    /*
        const arrOf = function(c) {
        return function(a) {
            arrGuard(a);
            return a.map(c);
        };
        module.exports.arrOf = arrOf;
        arrOfVinItemGuard(vin);
        const arrOfVinItemGuard = arrOf(vinItemGuard);
    */
    logger.silly({
        'vinToInputDetail <- vin': vin
    });
    // get the source output value and time
    // of each input (these things are used for days_destroyed calculation)
    typecheck.vinGuard(vin);
    return vin.map(function(vinitem) {
        if (vinitem.txid === undefined) {
            return;
        } else {
            return vinItemToInputDetailItem(vinitem)
                .map(function(voutitem) {
                    typecheck.voutItemGuard(
                        voutitem);
                    return voutitem;
                }).reduce(function(a, b) {
                    return a.concat(b);
                });
        }
    }, {
        concurrency: 1
    });
};
module.exports.vinToInputDetail =
    vinToInputDetail;

const rawTransactionToInputDetail = function rawTransactionToInputDetail(
    rawtransaction) {
    logger.silly({
        'rawTransactionToInputDetail <- txid': rawtransaction
            .txid
    });
    typecheck.rawTransactionGuard(rawtransaction);
    return vinToInputDetail(rawtransaction.vin)
        .map(function(inputdetail) {
            // resolve and denormalize destroy_stop now because big
            // transactions precipitate cartesian blow outs later
            return Promise.resolve(inputdetail).then(function(
                inputdetail) {
                if (inputdetail) {
                    inputdetail.destroy_stop = rawtransaction.time;
                }
                return inputdetail;
            });
        });
};
module.exports.rawTransactionToInputDetail =
    rawTransactionToInputDetail;

const rawTransactionToTransactionSignature = function rawTransactionToTransactionSignature(
    rawtransaction) {
    logger.silly({
        'rawTransactionToTransactionSignature <-': {
            'rawtransaction': rawtransaction
        }
    });
    typecheck.rawTransactionGuard(rawtransaction);
    return retry({
        max: 5
    }, function() {
        const transactionsignature = assign(
            rawtransaction);
        const inputdetail = Promise.all(
            rawTransactionToInputDetail(
                rawtransaction));
        return Promise.join(transactionsignature, inputdetail,
            function(
                transactionsignature, inputdetail) {
                transactionsignature.inputdetail =
                    inputdetail;
                typecheck.transactionSignatureGuard(
                    transactionsignature);
                return transactionsignature;
            });
    });
};
module.exports.rawTransactionToTransactionSignature =
    rawTransactionToTransactionSignature;
