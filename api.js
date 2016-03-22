/*eslint-env node, mocha, es6*/
const blocktool = require(process.cwd() + '/lib/blocktool.js');

/**

 * @swagger
 * resourcePath: /api
 * description: All about API
 */

/**
 * @swagger
 * path: /login
 * operations:
 *   -  httpMethod: POST
 *      summary: Login with username and password
 *      notes: Returns a user based on username
 *      responseClass: User
 *      nickname: login
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: username
 *          description: Your username
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: password
 *          description: Your password
 *          paramType: query
 *          required: true
 *          dataType: string
 */

exports.login = function*() {
    const user = {},
        query = this.request.query;

    user.username = query.username;
    user.password = query.password;

    this.body = user;
};

/**
 * @swagger
 * path: /blockcount
 * operations:
 *   -  httpMethod: GET
 *      summary: current blockcount
 *      notes: Returns latest known blockcount
 *      responseClass: Blockcount
 *      nickname: blockcount
 */

exports.blockcount = function*() {
    this.body = {
        'blockcount': yield blocktool.getBlockCount().then(function (
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
        'blocktime':
            (blockcount) ?
            yield blocktool.blockCountToTime(blockcount).then(function (
                blocktime) {
                return blocktime;
            }):
            yield blocktool.getLatestBlockTime().then(function (
                blocktime) {
                return blocktime;
            }),
        'blockcount': (blockcount) ?
            blockcount :
            yield blocktool.getBlockCount().then(function (
                blockcount) {
                return blockcount;
              })
                ,
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
 */
