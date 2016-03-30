"use strict";
/*eslint-env node, es6*/
const winston = require('winston');
const config = require(__dirname + '/../config/options.js');
const lenses = require('fantasy-lenses');

const logger = new(winston.Logger)({
    transports: [new(winston.transports.File)({
        filename: config.winston_log_file
    })],
    level: config.winston_log_level
});

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

const arrGuard = function(a) {
    if (Object.prototype.toString.call(a) !==
        '[object Array]') {
        throw new TypeError(
            "expected Array but received " +
            typeof(
                a));
    }
};
module.exports.arrGuard = arrGuard;

const arrOf = function(c) {
    return function(a) {
        arrGuard(a);
        return a.map(c);
    };
};
module.exports.arrOf = arrOf;

const numGuard = typeOf("number");
module.exports.numGuard = numGuard;

const intGuard = function(x) {
    logger.debug({
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
module.exports.intGuard = intGuard;

const natNumGuard = function(x) {
    logger.silly({
        'natNumGuard<-': {
            'x': x
        }
    });
    intGuard(x);
    if (x <= 0) {
        throw new TypeError(
            "expected positive integer but received " + x);
    }
};
module.exports.natNumGuard = natNumGuard;

const objGuard = typeOf("object");
module.exports.objGuard = objGuard;

const strGuard = typeOf("string");
module.exports.strGuard = strGuard;

const undefGuard = typeOf("undefined");
module.exports.undefGuard = undefGuard;

//const bool = typeOf("boolean");
//const func = typeOf("function");

const str64Guard = function(x) {
    logger.debug({
        'str64Guard<-': {
            'x': x
        }
    });
    strGuard(x);
    if (x.length !== 64) {
        throw new TypeError(
            "expected 64 character string but received " +
            x.length + " " + x);
    }
};
module.exports.str64Guard = str64Guard;

const blockHeaderGuard = function(blockheader) {
    objGuard(blockheader);
    const blockHeaderLense = lenses.Lens.objectLens,
        o = void intGuard(blockHeaderLense('time').run(
                blockheader)
            .get());
    return o;
};
module.exports.blockHeaderGuard = blockHeaderGuard;

const vinGuard = function(vin) {
    logger.silly({
        'vinGuard <- vin': vin
    });
    arrOfVinItemGuard(vin);
};
module.exports.vinGuard = vinGuard;

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
module.exports.vinItemGuard = vinItemGuard;

const arrOfVinItemGuard = arrOf(vinItemGuard);

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
    natNumGuard(lowcount);
    natNumGuard(highcount);
    natNumGuard(targettime);
    if (highcount < lowcount) {
        throw new TypeError("lowcount is higher than highcount " + JSON.stringify(
            guessObj));
    }
};
module.exports.guessGuard = guessGuard;

const inputDetailGuard = function(inputDetail) {
    logger.silly({
        'inputDetailGuard <- inputDetail': inputDetail
    });
    arrOfInputDetailItemGuard(inputDetail);
};
module.exports.inputDetailGuard = inputDetailGuard;

const inputDetailItemGuard = function(inputdetailItem) {
    logger.silly({
        'inputDetailItemGuard <-': {
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
    } else {
        if (n !== undefined) {
            throw new TypeError(
                "inputDetailItem requires a txid to be valid");
        }
    }
};
module.exports.inputDetailItemGuard = inputDetailItemGuard;

const arrOfInputDetailItemGuard = arrOf(inputDetailItemGuard);

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
    natNumGuard(blocktime);
    vinGuard(vin);
};
module.exports.rawTransactionGuard = rawTransactionGuard;

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
    inputDetailGuard(inputdetail);
};
module.exports.transactionSignatureGuard = transactionSignatureGuard;

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

const dateRangeGuard = (daterange) => {
    logger.debug({
        'dateRangeGuard <-': {
            'daterange': daterange
        }
    });
    objGuard(daterange);
    const dateRangeLense = lenses.Lens.objectLens,
        starttime = dateRangeLense('starttime').run(daterange).get(),
        endtime = dateRangeLense('endtime').run(daterange).get();
    natNumGuard(starttime);
    natNumGuard(endtime);
    if (starttime > endtime) {
        throw new Error(
            "dateRangeGuard: endtime is before starttime." + {
                'daterange': daterange
            });
    }
};
module.exports.dateRangeGuard = dateRangeGuard;

const arrOfStr64Guard = arrOf(str64Guard);
module.exports.arrOfStr64Guard = arrOfStr64Guard;

const arrOfIntGuard = arrOf(intGuard);
module.exports.arrOfIntGuard = arrOfIntGuard;

const arrOfNatNumGuard = arrOf(natNumGuard);
module.exports.arrOfNatNumGuard = arrOfNatNumGuard;

const blockRangeGuard = function(blockrange) {
    logger.silly({
        'blockRangeGuard <-': {
            'blockrange': blockrange
        }
    });
    objGuard(blockrange);
    const blockRangeLense = lenses.Lens.objectLens,
        blockcountlow = blockRangeLense('blockcountlow').run(
            blockrange).get(),
        blockcounthigh = blockRangeLense('blockcounthigh').run(
            blockrange).get();
    natNumGuard(blockcountlow);
    natNumGuard(blockcounthigh);
    if (blockcountlow > blockcounthigh) {
        logger.silly({
            'blockRangeGuard': {
                'blockcountlow': blockcountlow,
                'blockcounthigh': blockcounthigh
            }
        });
        throw new Error(
            "blockRangeGuard: blockcount high is less than or equal blockcountlow."
        );
    }
};
module.exports.blockRangeGuard = blockRangeGuard;
