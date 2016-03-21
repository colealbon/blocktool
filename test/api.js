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
const cheerio = require('cheerio');

suite('api:', function() {

    let server = require('../app.js');

    if (!server) server = https.createServer(ssloptions);
    const assert = require('chai').assert;
    test('this always passes', function() {
        assert.equal(1, 1);
    });

    test('/api should return statusCode 302', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/swagger',
            port: config.https_port,
            rejectUnauthorized: false,
            requestCert: false,
            agent: false
        }, function(res) {
            const body = [];
            res.on('data', function(data) {
                body.push(data);
            });
            res.on('end', function() {
                assert.equal(res.statusCode,
                    302);
                done();
            });
        });
        req.end();
    });

    test('/blockcount JSON validation', (done) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        const req = https.request({
            host: config.app_host,
            path: '/blockcount',
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
                        spool, {
                            decodeEntities: false
                        });
                    assert.isBelow(403581, JSON
                        .parse(
                            cheers.html()).blockcount
                    );
                    assert.isBelow(
                        1458536468849, JSON
                        .parse(
                            cheers.html()).timestamp
                    );
                }
                done();
            });
        });
        req.end();
    });
});
