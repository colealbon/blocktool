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
const cheerio = require('cheerio');

suite('index:', () => {

    let server = require('../app.js');
    const config = require(__dirname + '/../config/options.js');
    if (!server) server = https.createServer(ssloptions);
    const assert = require('chai').assert;
    test('this always passes', () => {
        assert.equal(1, 1);
    });

    test('check pulse https should return statusCode 200', (done) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/',
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
                    200);
                done();
            });
        });
        req.end();
    });
    test('diagnostics section', (done) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, (res) => {
            res.setEncoding('utf8');
            let spool = '';
            res.on('data', (data) => {
                spool = spool + data;
            });
            res.on('end', () => {
                if (res.statusCode == 200) {
                    const cheers = cheerio.load(
                        spool);
                    assert.ok(cheers(
                            '.app_name',
                            '#diagnostics')
                        .text());
                    assert.ok(cheers(
                            '.pulsetime',
                            '#diagnostics')
                        .text());
                    assert.isBelow(
                        1456714932435,
                        cheers('#pulsetime')
                        .text());
                }
                done();
            });
        });
        req.end();
    });

});
