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
        'blockcount': yield blocktool.getBlockCount().then((
            blockcount) => {
            return blockcount;
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
 */
