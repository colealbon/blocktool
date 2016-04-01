"use strict";
/*eslint-env node, es6*/
const memoizee = require('memoizee');
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

const slow_getBlockCount = function() {
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
                return blockcount;
            });
    });
};
const getBlockCount = memoizee(slow_getBlockCount, {
    maxAge: 1000
});
module.exports.getBlockCount = getBlockCount;

const slow_blockRangeToBlockCount = function(blockrange) {
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
const blockRangeToBlockCount = memoizee(slow_blockRangeToBlockCount);
module.exports.blockRangeToBlockCount = blockRangeToBlockCount;

const slow_dateRangeToBlockCount = function*(daterange) {
    logger.debug('dateRangeToBlockCount <-', {
        'daterange': daterange
    });
    typecheck.dateRangeGuard(daterange);
    const blockCountArr = dateRangeToBlockRange(daterange).then(function(
        blockrange) {
        return blockRangeToBlockCount(blockrange).then(function(
            blockCountArr) {
            return blockCountArr;
        });
    });
    return yield blockCountArr;
};
const dateRangeToBlockCount = memoizee(slow_dateRangeToBlockCount);
module.exports.dateRangeToBlockCount = dateRangeToBlockCount;

const slow_blockHashToTxid = function(blockhash) {
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

const slow_dateRangeToBlockRange = function dateRangeToBlockRange(
    daterange) {
    logger.debug({
        'dateRangeToBlockRange <-': {
            'daterange': daterange
        }
    });
    typecheck.dateRangeGuard(daterange);
    return Promise.props({
            blockcountlow: timeToBlockCount(daterange.starttime),
            blockcounthigh: timeToBlockCount(daterange.endtime)
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
const dateRangeToBlockRange = memoizee(slow_dateRangeToBlockRange);
module.exports.dateRangeToBlockRange = dateRangeToBlockRange;

const slow_blockHashToBlockHeader = function(blockhash) {
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
const blockHashToBlockHeader = memoizee(
    slow_blockHashToBlockHeader);
module.exports.blockHashToBlockHeader =
    blockHashToBlockHeader;

const slow_blockCountToBlockhash = function(blockcount) {
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

const slow_blockCountToTime = function(blockcount) {
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
module
    .exports.blockCountToTime = blockCountToTime;

const slow_blockHeaderToTime = function(blockheader) {
    logger.silly({
        'slow_blockHeaderToTime <-': {
            'blockheader_hash': blockheader.hash
        }
    });
    typecheck.blockHeaderGuard(blockheader);
    typecheck.intGuard(blockheader.time);
    return blockheader.time;
};
const blockHeaderToTime = memoizee(slow_blockHeaderToTime);
module.exports.blockHeaderToTime = blockHeaderToTime;

const slow_getLatestBlockTime = function() {
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

const slow_guess = function slow_guess(guessObj) {
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

const guess = memoizee(slow_guess);
module.exports.guess =
    guess;

const slow_timeToBlockCount = function(targettime) {
    logger.silly({
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
                logger.silly({
                    'slow_timeToBlockCount->': {
                        'guesscount': guesscount
                    }
                });
                typecheck.intGuard(guesscount);
                return guesscount;
            });
    });
};
const timeToBlockCount = memoizee(slow_timeToBlockCount);
module
    .exports.timeToBlockCount = timeToBlockCount;

const slow_txidToRawTransaction = function(txid) {
    //adds a retry to bitcoin core"s getrawtransaction(txid, verbose);
    logger.debug({
        "txidToRawTransaction <-": {
            "txid": txid
        }
    });
    typecheck.str64Guard(txid);
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
                typecheck.rawTransactionGuard(rawtransaction);
                logger.debug({
                    'txidToRawTransaction -> ': rawtransaction
                });
                return rawtransaction;
            });
    });
};
const txidToRawTransaction = memoizee(slow_txidToRawTransaction);
module
    .exports.txidToRawTransaction = txidToRawTransaction;

const slow_txidToTransactionSignature = function(txid) {
    //append input source info to a transaction (needed for days destroyed calc)
    logger.debug({
        "txidToTransactionSignature <-": {
            "txid": txid
        }
    });
    typecheck.str64Guard(txid);
    return txidToRawTransaction(txid).then(function(
        rawtransaction) {
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
const txidToTransactionSignature = memoizee(
    slow_txidToTransactionSignature);
module.exports.txidToTransactionSignature =
    txidToTransactionSignature;

const slow_txidToVout = function(txid) {
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
const txidToVout = memoizee(slow_txidToVout);
module.exports.txidToVout =
    txidToVout;

const slow_vinItemToInputDetailItem = function(vinItem) {
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
const vinItemToInputDetailItem = memoizee(
    slow_vinItemToInputDetailItem);
module.exports.vinItemToInputDetailItem =
    vinItemToInputDetailItem;

const slow_vinToInputDetail = function(vin) {
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
                .map(function(inputdetailitem) {
                    typecheck.inputDetailItemGuard(
                        inputdetailitem);
                    return inputdetailitem;
                }).reduce(function(a, b) {
                    return a.concat(b);
                });
        }
    }, {
        concurrency: 1
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
    typecheck.rawTransactionGuard(rawtransaction);
    return vinToInputDetail(rawtransaction.vin);
};
const rawTransactionToInputDetail = memoizee(
    slow_rawTransactionToInputDetail);
module.exports.rawTransactionToInputDetail =
    rawTransactionToInputDetail;


const slow_rawTransactionToTransactionSignature = function(
    rawtransaction) {
    logger.silly({
        'rawTransactionToTransactionSignature <-': {
            'rawtransaction': rawtransaction
        }
    });
    typecheck.rawTransactionGuard(rawtransaction);
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
};
const rawTransactionToTransactionSignature =
    slow_rawTransactionToTransactionSignature;
module.exports.rawTransactionToTransactionSignature =
    rawTransactionToTransactionSignature;
