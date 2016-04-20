'use strict';
/*eslint-env node, mocha, es6 */

const koa = require('koa'),
    router = require('koa-route'),
    views = require('co-views'),
    serve = require('koa-static'),
    api = require('./api.js'),
    path = require('path'),
    swagger = require('swagger-koa'),
    config = require(__dirname + "/config/options.js"),
    logger = require('koa-logger'),
    fs = require('fs'),
    https = require('https'),
    forceSSL = require('koa-force-ssl'),
    blocktool = require('./lib/blocktool.js');

const app = module.exports = koa();

app.use(logger());
app.use(forceSSL());

const ssloptions = {
    key: fs.readFileSync(config.server_key),
    cert: fs.readFileSync(config.server_crt)
};

const render = views(__dirname + '/views', {
    map: {
        html: 'swig'
    }
});

function* index() {
    this.body = yield render('index.swig', {
        'timestamp': new Date().getTime(),
        'app_name': config.app_name,
        'blockcount': yield blocktool.getBlockCount().then(function(
            blockcount) {
            return blockcount;
        }),
        'blocktime': yield blocktool.getLatestBlockTime().then(
            function(
                blocktime) {
                //return blocktime;
                var dt = new Date(0);
                return dt.setUTCSeconds(blocktime);
            }),
    });
}

app.use(swagger.init({
    apiVersion: '1.0',
    swaggerVersion: '1.0',
    basePath: 'https://' + config.app_host + ':' + config.https_port,
    swaggerURL: '/swagger',
    swaggerJSON: '/api-docs.json',
    swaggerUI: './public/swagger',
    apis: [config.blockchainxd_swagger_index]
}));

app.use(serve(path.join(__dirname, 'public')));
app.use(router.get('/', index));
app.use(router.get('/blockcount', api.blockcount));
app.use(router.get('/blocktime', api.blocktime));
app.use(router.get('/transactionsignature', api.transactionsignature));
app.use(router.get('/txid', api.txid));
app.use(router.get('/blockhash', api.blockhash));

const server = https.createServer(ssloptions, app.callback()).listen(
    config.https_port);
module.exports.server = server;
