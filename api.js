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
 *        - name: targettime
 *          description: unix timestamp
 *          paramType: query
 *          required: false
 *          dataType: integer
 */

exports.blockcount = function*() {
    const query = this.request.query;
    const targettime = parseInt(query.targettime);
    this.body = {
        'blockcount': (targettime) ?
            yield blocktool.timeToBlockCount(targettime).then(function(
                blockcount) {
                return blockcount;
            }) : yield blocktool.getBlockCount().then(function(
                blockcount) {
                return blockcount;
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

exports.blocktime = function*() {
    const query = this.request.query;
    const blockcount = parseInt(query.blockcount);

    this.body = {
        'blocktime': (blockcount) ?
            yield blocktool.blockCountToTime(blockcount).then(function(
                blocktime) {
                return blocktime;
            }) : yield blocktool.getLatestBlockTime().then(function(
                blocktime) {
                return blocktime;
            }),
        'blockcount': (blockcount) ?
            blockcount : yield blocktool.getBlockCount().then(function(
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

exports.transactionsignature = function*() {
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
 *          required: true
 *          dataType: array
 */

exports.txid = function*() {
    const query = this.request.query;
    const blockhash = query.blockhash;
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
