'use strict';
/*eslint-env node, mocha, es6 */

const koa = require('koa'),
    router = require('koa-route'),
    views = require('co-views'),
    serve = require('koa-static'),
    api = require('./api'),
    path = require('path'),
    swagger = require('swagger-koa'),
    config = require(__dirname + "/config/options.js"),
    logger = require('koa-logger'),
    fs = require('fs'),
    https = require('https'),
    forceSSL = require('koa-force-ssl');

const app = koa();

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
        'app_name': config.app_name
    });
}

app.use(swagger.init({
    apiVersion: '1.0',
    swaggerVersion: '1.0',
    basePath: 'https://' + config.app_host + ':' + config.https_port,
    swaggerURL: '/swagger',
    swaggerJSON: '/api-docs.json',
    swaggerUI: './public/swagger',
    apis: ['./api.js', './api.yml', './api.coffee']
}));

app.use(serve(path.join(__dirname, 'public')));

app.use(router.get('/', index));

app.use(router.post('/login', api.login));

const server = https.createServer(ssloptions, app.callback()).listen(config.https_port);
module.exports.server = server;
