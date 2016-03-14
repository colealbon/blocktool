'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const config = require(__dirname + '/../config/options.js');
const fs = require('fs');
const ssloptions = {
    key: fs.readFileSync(config.server_key),
    cert: fs.readFileSync(config.server_crt)
};
const https = require('https');

suite('api:', function () {

    let server = require('../app.js');

    if (!server) server = https.createServer(ssloptions);
    const assert = require('chai').assert;
    test('this always passes', function () {
        assert.equal(1, 1);
    });

    test('/api should return statusCode 302', function (done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/swagger',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function (res) {
            const body = [];
            res.on('data', function (data) {
                body.push(data);
            });
            res.on('end', function () {
                assert.equal(res.statusCode,
                    302);
                done();
            });
        });
        req.end();
    });
});
