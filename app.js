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
        'app_host': config.app_host,
        'https_port': config.https_port,
        'blockcount': yield blocktool.getBlockCount().then(function(
            blockcount) {
            return blockcount;
        }),
        'blocktime': yield blocktool.getLatestBlockTime().then(
            function(blocktime) {
                //return blocktime;
                const dt = new Date(0);
                return dt.setUTCSeconds(blocktime);
            }
        )
    });
}

// APP SERVER
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

// WEB SERVER
const server = https.createServer(ssloptions, app.callback()).listen(
    config.https_port);
module.exports.server = server;

// SOCKET SERVER live status updates
const io = require('socket.io')(server);
let PULSE = new Date().getTime();

io.on('connection', function(socket) {
    // node server time
    const pulse = setInterval(function emitpulse() {
        const newpulse = parseInt(new Date().getTime() /
            1000, 10);
        if (PULSE !== newpulse) {
            // without this "if" statement theres mysteriously 2 beats per sec
            // it might be called twice because of connection event, but keeping
            // this poller inside connection means that no polling happens when
            // nobody is connected. additional complexity hit but less noise
            PULSE = newpulse;
            //console.log(PULSE);
            io.volatile.emit('pulsetime', new Date().getTime());
        }
    }, config.heartbeat_seconds * 1000);

    // current blockcount
    let oldBlockCount;
    const blockcount_poller = setInterval(function blockcountPoller() {
        blocktool.getBlockCount().then(function handleBlockCount(
            blockcount) {
            if (blockcount !== oldBlockCount) {
                io.volatile.emit('blockcount',
                    blockcount);
                oldBlockCount = blockcount;
            }
        });
    }, config.heartbeat_seconds * 1000);

    // current blocktime
    let oldBlockTime;
    const blocktime_poller = setInterval(function blocktimePoller() {
        blocktool.getLatestBlockTime().then(function handleBlockTime(
            blocktime) {
            if (blocktime !== oldBlockTime) {
                io.volatile.emit('blocktime', blocktime);
                oldBlockTime = blocktime;
            }
        });
    }, config.heartbeat_seconds * 1000);

    socket.on('disconnect', function() {
        clearInterval(pulse);
        clearInterval(blockcount_poller);
        clearInterval(blocktime_poller);
    });
});
