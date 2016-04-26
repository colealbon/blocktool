'use strict';
/*eslint-env node, mocha, es6*/
const blocktool = require('./lib/blocktool.js');

/**

 * @swagger
 * resourcePath: /api
 * description: All about API
 */

/**
 * @swagger
 * path: /blockcount
 * operations:
 *   -  httpMethod: GET
 *      summary: current blockcount or blockcount for provided blocktime
 *      notes: Returns latest known blockcount
 *      responseClass: Blockcount
 *      nickname: blockcount
 *      parameters:
 *        - name: starttime
 *          description: unix timestamp (10 digits)
 *          paramType: query
 *          required: false
 *          dataType: integer
 *        - name: endtime
 *          description: unix timestamp (10 digits)
 *          paramType: query
 *          required: false
 *          dataType: integer
 */

exports.blockcount = function* blockcount() {
    const query = this.request ? this.request.query : undefined;
    let starttime;
    if (query.starttime === undefined && query.endtime === undefined) {
        starttime = yield blocktool.getLatestBlockTime().then(
            function(blockcount) {
                return parseInt(blockcount);
            });
    } else {
        starttime = parseInt(query.starttime);
    }
    const endtime = query ? parseInt(query.endtime) : null;
    this.body = {
        'starttime': starttime,
        'endtime': endtime,
        'blockcount': yield blocktool.dateRangeToBlockCount({
            'starttime': starttime || endtime,
            'endtime': endtime || starttime
        }),
        'timestamp': new Date().getTime()
    };
};

/**
 * @swagger
 * path: /blocktime
 * operations:
 *   -  httpMethod: GET
 *      summary: current blocktime or blocktime for provided blockcount
 *      notes: blocktime, blockcount and server timestamp
 *      responseClass: Blocktime
 *      nickname: blocktime
 *      parameters:
 *        - name: blockcount
 *          description: blockcount
 *          paramType: query
 *          required: false
 *          dataType: integer
 */

exports.blocktime = function* blocktime() {
    const query = this.request.query;
    const blockcount = parseInt(query.blockcount);

    this.body = {
        'blocktime': (blockcount) ?
            yield blocktool.blockCountToTime(blockcount).then(
                function(
                    blocktime) {
                    return blocktime;
                }) : yield blocktool.getLatestBlockTime().then(
                function(
                    blocktime) {
                    return blocktime;
                }),
        'blockcount': (blockcount) ?
            blockcount : yield blocktool.getBlockCount().then(
                function(
                    blockcount) {
                    return blockcount;
                }),
        'timestamp': new Date().getTime()
    };
};

/**
 * @swagger
 * path: /transactionsignature
 * operations:
 *   -  httpMethod: GET
 *      summary: rawtransaction augmented with details of input from source tx.
 *      notes: Returns raw transaction json with input detail
 *      responseClass: TransactionSignature
 *      nickname: transactionsignature
 *      parameters:
 *        - name: txid
 *          description: 64 character string
 *          paramType: query
 *          required: true
 *          dataType: string
 */

exports.transactionsignature = function* transactionsignature() {
    const query = this.request.query;
    const txid = query.txid;
    this.body = {
        'transactionsignature': yield blocktool.txidToTransactionSignature(
            txid).then(function(transactionsignature) {
            return transactionsignature;
        }),
        'timestamp': new Date().getTime()
    };
};

/**
 * @swagger
 * path: /txid
 * operations:
 *   -  httpMethod: GET
 *      summary: array of txid for a blockhash.
 *      notes: Returns txid json
 *      responseClass: Txid
 *      nickname: txid
 *      parameters:
 *        - name: blockhash
 *          description: 64 character string
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: blockcount
 *          description: 64 character string
 *          paramType: query
 *          required: false
 *          dataType: integer
 */

exports.txid = function* txid() {
    const query = this.request.query;
    const blockcount = (query.blockcount) ?
        parseInt(query.blockcount) :
        yield blocktool.getBlockCount().then(function(blockcount) {
            return parseInt(blockcount);
        });
    const blockhash = (query.blockhash) ?
        query.blockhash :
        yield blocktool.blockCountToBlockhash(blockcount).then(
            function(
                blockhash) {
                return blockhash;
            });
    this.body = {
        'blockhash': blockhash,
        'txid': yield blocktool.blockHashToTxid(
            blockhash).then(function(txidArr) {
            return txidArr;
        }),
        'timestamp': new Date().getTime()
    };
};

/**
 * @swagger
 * path: /blockhash
 * operations:
 *   -  httpMethod: GET
 *      summary: blockhash for a given block count
 *      notes: Returns blockhash json
 *      responseClass: Blockhash
 *      nickname: blockhash
 *      parameters:
 *        - name: blockcount
 *          description: Integer
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: starttime
 *          description: unix timestamp (10 digits)
 *          paramType: query
 *          required: false
 *          dataType: integer
 *        - name: endtime
 *          description: unix timestamp (10 digits)
 *          paramType: query
 *          required: false
 *          dataType: integer
 */

exports.blockhash = function* blockhash() {
    const query = this.request ? this.request.query : undefined;
    const blockcount = (query) ? parseInt(query.blockcount, 10) : undefined;
    if (isNaN(blockcount)) {
        let starttime;
        if (query.starttime === undefined && query.endtime === undefined) {
            starttime = yield blocktool.getLatestBlockTime().then(
                function(blocktime) {
                    return parseInt(blocktime);
                });
        } else {
            starttime = parseInt(query.starttime);
        }
        const endtime = query ? parseInt(query.endtime) : null;
        this.body = {
            'starttime': starttime || endtime,
            'endtime': endtime || starttime,
            'blockhash': yield blocktool.dateRangeToBlockHash({
                'starttime': starttime || endtime,
                'endtime': endtime || starttime
            }),
            'timestamp': new Date().getTime()
        };
    } else {
        this.body = {
            'blockcount': blockcount,
            'blockhash': yield blocktool.blockCountToBlockhash(
                blockcount).then(function(
                blockhash) {
                return blockhash;
            }),
            'timestamp': new Date().getTime()
        };
    }
};

/**
 * @swagger
 * models:
 *   User:
 *     id: User
 *     properties:
 *       username:
 *         type: String
 *       password:
 *         type: String
 *   Blockcount:
 *     id: Blockcount
 *     properties:
 *       blockcount:
 *         type: integer
 *         required: true
 *       timestamp:
 *         type: integer
 *         required: true
 *   Blockhash:
 *     id: Blockhash
 *     properties:
 *       blockhash:
 *         type: string
 *         required: true
 *       timestamp:
 *         type: integer
 *         required: true
 *   Blocktime:
 *     id: Blocktime
 *     properties:
 *       blocktime:
 *         type: integer
 *         required: true
 *       blockcount:
 *         type: integer
 *         required: true
 *       timestamp:
 *         type: integer
 *         required: true
 *   Txid:
 *     id: Txid
 *     properties:
 *       blockhash:
 *         type: String
 *         required: true
 *       txid:
 *         type: array
 *         required: true
 *       timestamp:
 *         type: integer
 *         required: true
 */
