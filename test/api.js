'use strict';
/*eslint-env node, mocha, es6 */
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fs = require('fs');
const ssloptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
const https = require('https');

suite('api:', () => {

    let server = require('../app.js');
    const config = require(__dirname + '/../config/options.js');
    if (!server) server = https.createServer(ssloptions);
    const assert = require('chai').assert;
    test('this always passes', () => {
        assert.equal(1, 1);
    });

    test('/api should return statusCode 302', (done) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/swagger',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, (res) => {
            const body = [];
            res.on('data', (data) => {
                body.push(data);
            });
            res.on('end', () => {
                assert.equal(res.statusCode,
                    302);
                done();
            });
        });
        req.end();
    });
});
